function doPost(e) {
  try {
    // Parse the incoming JSON data
    var data = JSON.parse(e.postData.contents);
    
    // Command validation
    if (data.command !== "sendReport") {
      return ContentService.createTextOutput("Invalid command").setMimeType(ContentService.MimeType.TEXT);
    }

    var targetEmail = data.targetEmail;
    var date = data.date;
    var bookings = data.bookings || [];
    var totalPax = data.totalPax || 0;

    // 1. Create a new Spreadsheet
    var spreadsheetName = "Moreno Daily Report - " + date;
    var ss = SpreadsheetApp.create(spreadsheetName);
    var sheet = ss.getActiveSheet();
    
    // 2. Add Headers with styling
    var headers = ["Time", "Name", "Phone", "Room", "Guests", "Restaurant", "Notes"];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#f97316"); // Brand Orange
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    
    // 3. Add Data rows
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      sheet.appendRow([
        b.time, 
        b.name, 
        b.phone, 
        b.room, 
        b.guests, 
        b.restaurant,
        b.notes
      ]);
    }
    
    // 4. Auto-resize columns for better readability
    sheet.autoResizeColumns(1, headers.length);

    // 5. Generate PDF from the Spreadsheet
    var url = ss.getUrl();
    var pdfUrl = url.replace(/edit$/, '') + 'export?exportFormat=pdf&format=pdf' +
                 '&size=A4&portrait=true&fitw=true&sheetnames=false&printtitle=false&pagenumbers=true';
    var token = ScriptApp.getOAuthToken();
    
    var responsePdf = UrlFetchApp.fetch(pdfUrl, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var blobPdf = responsePdf.getBlob().setName("Moreno_Report_" + date + ".pdf");
    
    // 6. Generate Excel (.xlsx) from the Spreadsheet
    var xlsxUrl = url.replace(/edit$/, '') + 'export?exportFormat=xlsx&format=xlsx';
    var responseXlsx = UrlFetchApp.fetch(xlsxUrl, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var blobXlsx = responseXlsx.getBlob().setName("Moreno_Report_" + date + ".xlsx");

    // 7. Compose Email Body (HTML)
    var htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0c4a6e;">Moreno Horizon - Daily Report</h2>
        <p>Hello,</p>
        <p>Please find attached the daily booking report for <strong>${date}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f97316;">Summary</h3>
          <p><strong>Total Guests (Pax):</strong> ${totalPax}</p>
          <p><strong>Total Bookings:</strong> ${bookings.length}</p>
        </div>
        <p>You can also view the live Google Sheet here:<br/>
        <a href="${url}" style="color: #0c4a6e;">Open Google Sheet</a></p>
        <br/>
        <p style="font-size: 12px; color: #64748b;">Generated automatically by Moreno Horizon System.</p>
      </div>
    `;

    // 8. Send the Email
    MailApp.sendEmail({
      to: targetEmail,
      subject: "Daily Report: " + date + " - Moreno Horizon",
      htmlBody: htmlBody,
      attachments: [blobPdf, blobXlsx] // Attach both PDF and Excel!
    });
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success", 
      "sheetUrl": url
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error", 
      "message": err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Needed to avoid CORS issues when calling from React app
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
