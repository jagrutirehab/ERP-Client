import * as XLSX from 'xlsx'

const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const buildRows = (list, cycleLabel, trainingName, fileUrl) =>
    list?.map((ack, i) => ({
        '#': i + 1,
        'Training Name': trainingName || '—',
        'File Link': fileUrl || '—',
        'Cycle': cycleLabel,
        'Employee Name': ack?.employee?.name || '—',
        'Email': ack?.employee?.email || '—',
        'Role': ack?.employee?.role || '—',
        'Center': ack?.employee?.center?.title || '—',
        'Acknowledged On': formatDate(ack?.acknowledgedOn)
    })) || []

const exportTrainingHistory = (data) => {
    if (!data) return

    const trainingName = data?.trainingName || '—'
    const fileUrl = data?.files?.[0]?.url || '—'
    const wb = XLSX.utils.book_new()

    const allRows = [
        ...buildRows(data?.currentCycle?.acknowledged, 'Current Cycle', trainingName, fileUrl),
        ...(data?.history?.flatMap(h =>
            buildRows(h?.acknowledged, `Cycle ${h?.cycle} (Reset: ${formatDate(h?.resetDate)})`, trainingName, fileUrl)
        ) || [])
    ]

    const overallSheet = XLSX.utils.json_to_sheet(allRows)
    XLSX.utils.book_append_sheet(wb, overallSheet, 'Overall')

    const currentRows = buildRows(data?.currentCycle?.acknowledged, 'Current Cycle', trainingName, fileUrl)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(currentRows), 'Current Cycle')

    data?.history?.forEach(h => {
        const rows = buildRows(
            h?.acknowledged,
            `Cycle ${h?.cycle}`,
            trainingName,
            fileUrl
        )
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), `Cycle ${h?.cycle}`)
    })

    XLSX.writeFile(wb, `${trainingName}_history.xlsx`)
}

export default exportTrainingHistory