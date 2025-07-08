import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TimelineRight from "./Components/Timeline/TimelineRight";
import TimelineLeft from "./Components/Timeline/TimelineLeft";
import RenderWhen from "../../../Components/Common/RenderWhen";
import TimelineCenter from "./Components/Timeline/TimelineCenter";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { InternTimelineFilter } from "../../../Components/constants/patient";

const Timeline = () => {
  const { id: internId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [filter, setFilter] = useState(InternTimelineFilter.map((f) => f.name));
  const [action, setAction] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFilter = () => setDropdown(!dropdown);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const params = {
        intern: internId,
        filter: filter.join(","),
      };
      if (action) params.action = action;

      const data = await axios.get("/timeline/intern", { params });
      setTimeline(data.timeline || []);
    } catch (error) {
      console.error("Failed to fetch timeline", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (internId) fetchTimeline();
  }, [internId, filter, action]);

  return (
    <div>
      <div className="py-3 d-flex justify-content-end align-items-end text-end">
        <FormGroup check inline>
          <Input
            checked={action === "DELETED"}
            value="DELETED"
            onChange={() => setAction(action === "DELETED" ? null : "DELETED")}
            type="checkbox"
          />
          <Label check>Delete Filter</Label>
        </FormGroup>
        <Dropdown isOpen={dropdown} toggle={toggleFilter}>
          <DropdownToggle caret>Filters</DropdownToggle>
          <DropdownMenu>
            {(InternTimelineFilter || []).map((item, idx) => (
              <DropdownItem key={idx} value={item.name}>
                <div className="d-flex align-items-center">
                  <Input
                    className="mt-0"
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      const newFilter = filter.includes(value)
                        ? filter.filter((f) => f !== value)
                        : [...filter, value];
                      if (item.name === "DELETED") setAction(item.name);
                      else setFilter(newFilter);
                    }}
                    checked={filter.includes(item.name)}
                    value={item.name}
                    id={idx + item.name}
                  />
                  <Label className="mb-0 ms-2 w-100" htmlFor={idx + item.name}>
                    {item.label}
                  </Label>
                </div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="timeline">
        {loading ? (
          <p className="text-center py-4">Loading timeline...</p>
        ) : (timeline || []).length === 0 ? (
          <p className="text-center py-4">No activity found</p>
        ) : (
          timeline.map((item, idx) => (
            <React.Fragment key={idx}>
              <RenderWhen isTrue={item.relation === "INTERN"}>
                <TimelineLeft data={item} />
              </RenderWhen>
              <RenderWhen isTrue={item.relation === "DELETE_INTERN"}>
                <TimelineRight data={item} />
              </RenderWhen>
              <RenderWhen isTrue={item.relation === "INTERN_RECEIPT"}>
                <TimelineCenter data={item} />
              </RenderWhen>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;
