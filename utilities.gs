function createHeaders() {
   //Freezes the first row
  sheet.setFrozenRows(1);
  // Set the values we want for headers
   var values = [["Timestamp","BatchId","Brand","Application", "Device","Url","Performance Score","LAB FCP", "LAB LCP", "LAB CLS", "LAB Interactive", "LAB Total Blocking Time", "LAB Speed Index","FIELD FCP","First Input Delay (ms)","Cumulative Layout Shift (score)","Largest Contentful Paint (ms)", "FID Rating"," CLS Rating","LCP Rating","Overall Page Rating as per Google",
"LCP Fast %","LCP Average %","LCP Slow %",
"FID Fast %","FID Average %","FID Slow %",
"CLS Fast %","CLS Average %","CLS Slow %",
"FIELD Overall Result","Accessibility Score", "SEO Score", "Best Practices Score"
 ]];
  // Set the range of cells
  var range = sheet.getRange(1, 1, 1, 34);
  //Call the setValues method on range and pass in our values
  range.setValues(values);
}

  function deleteTriggers(){
   var triggers = ScriptApp.getProjectTriggers();
   var triggersPresent=printAndReturnTriggers();
   for (x of triggers){
    if (x.getHandlerFunction() == "oneByOneExecuteDesktopUrls" ||x.getHandlerFunction() == "oneByOneExecuteMobileUrls"  ||x.getHandlerFunction() == "failureRerun"){
        ScriptApp.deleteTrigger(x);
     }
    }
    var triggers = ScriptApp.getProjectTriggers();
    for (x of triggers){
    Logger.log(x.getHandlerFunction());
    }
  }

function createTriggers(){
 try{
   createTimeTrigger("oneByOneExecuteDesktopUrls",5);
   createTimeTrigger("oneByOneExecuteMobileUrls",5);
   createTimeTrigger("failureRerun",30);
   }catch(err){
     MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Trigger Creation Failed:  ","Failed To Create Both One by One URLs Execution and Failure Triggers !!! ");
   }

}

  function deleteThisTrigger(triggerName){
   var triggers = ScriptApp.getProjectTriggers();
    for (x of triggers){
    if (x.getHandlerFunction() == triggerName){
        ScriptApp.deleteTrigger(x);
     }
    }
  }

  function CheckTriggerExist(triggerName){
   var triggers = ScriptApp.getProjectTriggers();
    for (x of triggers){
    if (x.getHandlerFunction() == triggerName){
       return true;
     }
    }
  }
function deleteTrigger(triggerId) {
 var triggers = ScriptApp.getProjectTriggers();
 for (x of triggers){
 Logger.log(x.getHandlerFunction());
 if (x.getHandlerFunction() == "runScript1"){
    ScriptApp.deleteTrigger(x);
  }
 }
for (x of triggers){
 Logger.log(x.getHandlerFunction());
 }
}
function printAndReturnTriggers(){
    var triggers = ScriptApp.getProjectTriggers();
    var t= triggers.map((tt,i)=>  '\n'+" "+(i+1)+" "+tt.getHandlerFunction())
    console.log(t)
    return t;
}
function testDelete(){
    deleteTriggers();
    var triggers = ScriptApp.getProjectTriggers();
    var t= triggers.map((tt,i)=>  '\n'+" "+(i+1)+" "+tt.getHandlerFunction())
    console.log(t);
}

function testCreate(){
   createTimeTrigger("oneByOneExecuteDesktopUrls",5);
   createTimeTrigger("oneByOneExecuteMobileUrls",5);
   createTimeTrigger("failureRerun",30);

   var triggers = ScriptApp.getProjectTriggers();
   var t= triggers.map((tt,i)=>  '\n'+" "+(i+1)+" "+tt.getHandlerFunction())
   console.log(t);
}

function populateBothBatches_TBC() {
  try{
    spreadsheet.deleteSheet(CompletedExecutionsSheet);
    spreadsheet.insertSheet('CompletedExecutions');
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    spreadsheet.setActiveSheet(spreadsheet.getSheets()[0]);
 
    }
    catch(err){
      MailApp.sendEmail(notifactionEmailId, emailSubjectOwner+"Batch Population Failure:  ","Failed Population of Both Batch Data !!! "); 
    }
}

 function createTimeTrigger(tname,ttime) {
  var triggerExist = CheckTriggerExist(tname);
  if (!triggerExist){
  ScriptApp.newTrigger(tname)
    .timeBased()
    .everyMinutes(ttime)
    .create();
  }
}

function populateBothBatches_TOBEARCHIVED_WEHAVE_RESETBATCHNOW() {
  try{
  SpreadsheetApp.flush();
  var DesktopBatchSheet = spreadsheet.getSheetByName('DesktopBatch');
  var MobileBatchSheet = spreadsheet.getSheetByName('MobileBatch');
  var toPopulateDesktop = DesktopBatchSheet.getDataRange().getValues();
  var toPopulateMobile  = MobileBatchSheet.getDataRange().getValues();
   
  if(!toPopulateDesktop[0][6] && !toPopulateMobile[0][6]){
    spreadsheet.deleteSheet(CompletedExecutionsSheet);
    spreadsheet.insertSheet('CompletedExecutions');
   for (url of urlToMonitor){
   MobileBatchSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),url.batchName,0,"mobile",url.brand,url.app,url.url])   
   }
   for (url of urlToMonitor){
   DesktopBatchSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),url.batchName,0,"desktop",url.brand,url.app,url.url])   
   }
  } 
   MobileBatchSheet.insertRows(78,78);
   DesktopBatchSheet.insertRows(78,78);
   
   }
   catch(err){
      MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Batch Population Failure:  ","Failed Population of Both Batch Data !!! ");
    }

    try{
    createTriggers()
    }
     catch(err){
     MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Batch Population Failure:  ","Failed Population of Both Batch Data !!! ");
 }
  
}

function moveDataToMasterFinal(){
var data1 = sheet.getDataRange().getValues();
console.log("Number of Records to Copy "+ data1.length )
if(data1[0][6]){
//MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Move Data to  Master - Starts", "Started moving data to master - started, records to copy: "+ data1.length);
for (row of data1){
    let userFullnames = row.map(function(eachCell){
      if (row[0]===eachCell )
        {
            return  Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd")
        }
      else
        return eachCell ;
       })
    masterSheet.appendRow(userFullnames);
   }
  //MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Move Data to Master - Ends", "Moving data to master - finished successfully, records copied: "+ data1.length);
  }

    deleteTriggers();
    var t=printAndReturnTriggers(); 
  
   // spreadsheet.deleteSheet(CompletedExecutionsSheet);
   // spreadsheet.insertSheet('CompletedExecutions');
   // MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Triggers Deleted, Completed Executions Reset", "Final Reset - Triggers deletion finished successfully, below are the triggers present now: "+t);
    
}