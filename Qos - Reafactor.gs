function refactoredMoveEmailAttchmentsToSheets() {
  // Logs information about any attachments in the first 100 inbox threads.
var threads = GmailApp.search('from:noreply@jenkins.com subject:email_lag_report in:inbox is:unread has:attachment')
//after:'+yesterdayDate())
 //var threads = GmailApp.getInboxThreads(0, 100);
console.log(threads.length)

var msgs = GmailApp.getMessagesForThreads(threads);
console.log(msgs.length)
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('emails');
  


for (var i = 0 ; i < msgs.length; i++) {
  for (var j = 0; j < msgs[i].length; j++) {
    var attachments = msgs[i][j].getAttachments();
    for (var k = 0; k < attachments.length; k++) {
      Logger.log('Message "%s" contains the attachment "%s" (%s bytes)',
                 msgs[i][j].getSubject(), attachments[k].getName(), attachments[k].getSize());
       var csvData = Utilities.parseCsv(attachments[k].getDataAsString(), ",");

       if (attachments[k].getContentType() === "application/octet-stream") {
          for (x in csvData){
            if(x>=0){
             // csvData[x].unshift(insertTodayDate);
             var column6=0;
             if(csvData[x][5]>=0){
               column6=csvData[x][5];
             }
              console.log(csvData[x][0],csvData[x][1],csvData[x][2],csvData[x][3],csvData[x][4],column6,'\n',"Whole Row",'\n',csvData[x]);
              sheet.appendRow([csvData[x][0],csvData[x][1],csvData[x][2],csvData[x][3],csvData[x][4],column6])
              };
          }
         } 
        
    }
    GmailApp.markMessageRead(msgs[i][j]);
    }
    
  }
}

