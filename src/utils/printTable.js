/**
 * Utility to print clean data tables without browser page UI clutter.
 * Opens an isolated invisible iframe to trigger printing only the formatted report.
 */
export function printTable({
  title = "Report",
  subtitle = "",
  columns = [],
  rows = [],
  footer = null,
  summary = null,
}) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  const summaryHtml =
    summary && summary.length > 0
      ? `<div class="summary-bar">
        ${summary
          .map(
            (s) =>
              `<div class="summary-item"><span class="sum-label">${s.label}:</span> <span class="sum-val">${s.value}</span></div>`
          )
          .join("")}
       </div>`
      : "";

  const headerHtml = `
    <tr>
      ${columns
        .map(
          (c) =>
            `<th style="text-align: ${c.align || "left"}">${c.label}</th>`
        )
        .join("")}
    </tr>
  `;

  const rowsHtml =
    rows.length === 0
      ? `<tr><td colspan="${columns.length}" style="text-align: center; padding: 24px; color: #64748B;">No records match the current filters.</td></tr>`
      : rows
          .map(
            (row, rIdx) => `
        <tr class="${rIdx % 2 === 1 ? "even" : ""}">
          ${columns
            .map((c) => {
              const val = c.render ? c.render(row, rIdx) : (row[c.key] ?? "-");
              return `<td style="text-align: ${c.align || "left"}">${val}</td>`;
            })
            .join("")}
        </tr>
      `
          )
          .join("");

  const footerHtml = footer
    ? `<tr class="footer-row">
        ${footer
          .map(
            (f) =>
              `<td style="text-align: ${f.align || "left"}" colspan="${
                f.colSpan || 1
              }">${f.content}</td>`
          )
          .join("")}
       </tr>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: landscape;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 12px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0F172A;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .title-area h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: -0.2px;
          }
          .title-area .subtitle {
            margin-top: 3px;
            font-size: 11px;
            color: #475569;
            font-weight: 500;
          }
          .meta-area {
            text-align: right;
            font-size: 10px;
            color: #64748B;
            line-height: 1.5;
          }
          .summary-bar {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 12px;
          }
          .summary-item {
            font-size: 11px;
          }
          .sum-label {
            color: #475569;
            font-weight: 600;
          }
          .sum-val {
            color: #0F172A;
            font-weight: 800;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          th {
            background-color: #F1F5F9;
            color: #0F172A;
            font-weight: 800;
            font-size: 10.5px;
            padding: 6px 8px;
            border: 1px solid #CBD5E1;
            white-space: nowrap;
          }
          td {
            padding: 5px 8px;
            border: 1px solid #CBD5E1;
            font-size: 10px;
          }
          tr.even {
            background-color: #F8FAFC;
          }
          .footer-row td {
            font-weight: 800;
            background-color: #F1F5F9;
            border-top: 2px solid #0F172A;
            color: #0F172A;
            font-size: 10.5px;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-align: center;
          }
          .badge-inward {
            background: #DCFCE7;
            color: #166534;
            border: 1px solid #86EFAC;
          }
          .badge-outward {
            background: #DBEAFE;
            color: #1E40AF;
            border: 1px solid #93C5FD;
          }
          .badge-grade-a {
            background: #EFF6FF;
            color: #1D4ED8;
            border: 1px solid #BFDBFE;
          }
          .badge-common-b {
            background: #F5F3FF;
            color: #6D28D9;
            border: 1px solid #DDD6FE;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="title-area">
            <h1>${title}</h1>
            ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
          </div>
          <div class="meta-area">
            <div>Printed: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div>Total Records: ${rows.length}</div>
          </div>
        </div>
        ${summaryHtml}
        <table>
          <thead>
            ${headerHtml}
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          ${footer ? `<tfoot>${footerHtml}</tfoot>` : ""}
        </table>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 250);
}
