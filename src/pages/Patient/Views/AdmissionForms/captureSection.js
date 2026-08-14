import html2canvas from "html2canvas";

/**
 * Rasterise a DOM section into one A4 page of a jsPDF document.
 *
 * Clones the node, syncs radio/checkbox checked state, collapses radio groups to
 * a single value, swaps every input/textarea/select for an underlined span
 * (honouring data-no-underline), scales fonts and borders, then html2canvas ->
 * pdf.addImage scaled to fit one page.
 *
 * Extracted from AdmissionForms.js so the consent, admission, discharge and ECT
 * consent flows all share one implementation rather than copying it.
 */
export const captureSection = async (ref, pdf, isFirstPage = false) => {
  if (!ref?.current) return pdf;
  const el = ref.current;

  // wait for fonts
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  // === CLONE + replace inputs with spans ===
  const clone = el.cloneNode(true);

  // Sync radio/checkbox checked state from original to clone
  const originalRadios = el.querySelectorAll(
    "input[type='radio'], input[type='checkbox']",
  );
  const cloneRadios = clone.querySelectorAll(
    "input[type='radio'], input[type='checkbox']",
  );
  originalRadios.forEach((orig, i) => {
    if (cloneRadios[i]) cloneRadios[i].checked = orig.checked;
  });

  // Handle radio groups: replace each group with "Selected" or "A / B"
  const handledRadioNames = new Set();
  const allRadios = clone.querySelectorAll("input[type='radio']");
  allRadios.forEach((radio) => {
    const name = radio.getAttribute("name");
    if (!name || handledRadioNames.has(name)) return;
    handledRadioNames.add(name);

    const group = clone.querySelectorAll(
      `input[type='radio'][name='${name}']`,
    );
    const labels = [];
    let selectedValue = null;

    group.forEach((r) => {
      const label = r.closest("label");
      const text = r.value || (label ? label.textContent.trim() : "");
      if (r.checked) selectedValue = text;
      labels.push({ radio: r, label, text });
    });

    // Build replacement span
    const resultSpan = document.createElement("span");
    resultSpan.style.fontWeight = "bold";
    resultSpan.style.textTransform = "uppercase";
    resultSpan.style.marginLeft = "10px";

    if (selectedValue) {
      resultSpan.innerText = selectedValue.toUpperCase();
      // resultSpan.style.textDecoration = "underline";
    } else {
      resultSpan.innerText = labels
        .map((l) => l.text)
        .join(" / ")
        .toUpperCase();
    }

    // Insert result span before first label, then remove all labels
    const firstLabel = labels[0].label || labels[0].radio.parentNode;
    firstLabel.parentNode.insertBefore(resultSpan, firstLabel);
    labels.forEach(({ radio, label }) => {
      if (label) label.remove();
      else radio.remove();
    });
  });

  const inputsInClone = clone.querySelectorAll("input, textarea, select");
  inputsInClone.forEach((input) => {
    const span = document.createElement("span");
    let value = "";
    if (input.tagName.toLowerCase() === "select") value = input.value || "";
    else if (input.type === "date" && input.value)
      value = new Date(input.value).toLocaleDateString("en-GB");
    else value = input.value || input.innerText || "";

    span.innerText = value ? String(value).toUpperCase() : "\u00A0";
    span.style.fontWeight = "bold";
    span.style.textTransform = "uppercase";
    if (!input.hasAttribute("data-no-underline")) {
      span.style.borderBottom = "1px solid #000";
    }
    span.style.display = "inline-block";
    span.style.minWidth = "100px";
    span.style.maxWidth = "100%";
    span.style.wordBreak = "break-word";
    span.style.margin = "0 4px";
    input.parentNode.replaceChild(span, input);
  });

  // === Fix known styled elements ===
  const defaults = {
    orgName: { fontSize: "26px" },
    address: { fontSize: "18px" },
    phone: { fontSize: "18px" },
    website: { fontSize: "18px" },
  };
  Object.keys(defaults).forEach((cls) => {
    const elems = clone.querySelectorAll(`.${cls}`);
    elems.forEach((elx) => {
      Object.assign(elx.style, defaults[cls]);
    });
  });

  // wrapper
  const wrapper = document.createElement("div");
  while (clone.firstChild) wrapper.appendChild(clone.firstChild);
  clone.appendChild(wrapper);

  // Map PDF width → CSS px
  const pdfW_pts = pdf.internal.pageSize.getWidth();
  const pdfH_pts = pdf.internal.pageSize.getHeight();
  const PT_TO_PX = 96 / 72;
  const marginPts = 10;
  const marginPx = Math.round(marginPts * PT_TO_PX);
  const pdfWidthPx = Math.floor(pdfW_pts * PT_TO_PX);

  clone.style.position = "absolute";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.zIndex = "2147483647";
  clone.style.boxSizing = "border-box";
  clone.style.background = "#fff";
  clone.style.margin = "0";
  clone.style.overflow = "visible";
  clone.style.width = pdfWidthPx - marginPx * 2 + "px";

  wrapper.style.display = "block";
  wrapper.style.width = "100%";
  wrapper.style.boxSizing = "border-box";

  // improve borders & font scaling
  const BORDER_MULT = 1.3;
  const TEXT_MULT = 1.05;
  const allElems = clone.querySelectorAll("*");
  allElems.forEach((elx) => {
    const cs = window.getComputedStyle(elx);
    if (cs.fontSize) {
      const fs = parseFloat(cs.fontSize);
      if (!Number.isNaN(fs) && fs > 0) {
        elx.style.fontSize = `${Math.round(fs * TEXT_MULT)}px`;
      }
    }
    ["Top", "Right", "Bottom", "Left"].forEach((s) => {
      const val = cs[`border${s}Width`];
      if (val && val !== "0px") {
        const num = parseFloat(val) || 0;
        if (num > 0)
          elx.style[`border${s}Width`] = `${Math.max(
            1,
            num * BORDER_MULT,
          )}px`;
      }
    });

    if (cs.display === "flex") {
      elx.style.flexWrap = "wrap";
      elx.style.justifyContent = "flex-start";
    }
  });

  document.body.appendChild(clone);
  await new Promise((r) => setTimeout(r, 100));

  const cloneFullHeight = Math.ceil(wrapper.scrollHeight);
  const DPR = window.devicePixelRatio || 1;
  const PREFERRED_SCALE = 2;
  let captureScale = Math.min(Math.max(1.5, DPR), PREFERRED_SCALE);

  // === Always fit whole content into one single PDF page ===
  const addCanvasAsSinglePage = (canvas, firstPageFlag) => {
    const usableWpts = pdfW_pts - marginPts * 2;
    const usableHpts = pdfH_pts - marginPts * 2;

    const cW_px = canvas.width;
    const cH_px = canvas.height;

    const fitScale = Math.min(usableWpts / cW_px, usableHpts / cH_px);

    const targetW_pts = cW_px * fitScale;
    const targetH_pts = cH_px * fitScale;

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    if (!firstPageFlag) pdf.addPage();
    pdf.addImage(
      imgData,
      "JPEG",
      marginPts,
      marginPts,
      targetW_pts,
      targetH_pts,
      undefined,
      "FAST",
    );
  };

  try {
    wrapper.style.transform = "translateY(0px)";
    clone.style.height = cloneFullHeight + "px";
    const c = await html2canvas(clone, {
      scale: captureScale,
      useCORS: true,
      backgroundColor: "#fff",
      imageTimeout: 20000,
      allowTaint: false,
      windowWidth: document.documentElement.scrollWidth,
    });
    addCanvasAsSinglePage(c, isFirstPage);
  } catch (err) {
    console.error("captureSection error:", err);
  } finally {
    try {
      document.body.removeChild(clone);
    } catch (e) {}
  }

  return pdf;
};
