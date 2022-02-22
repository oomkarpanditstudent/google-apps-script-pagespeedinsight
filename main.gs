var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var masterSpreadsheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/XXXXX'); //changed data sheet
var masterSheet = masterSpreadsheet.getSheetByName('Data');
var sheet = spreadsheet.getSheetByName('Data');
var FailureSheet = spreadsheet.getSheetByName('Failures');
var BatchSheet = spreadsheet.getSheetByName('Batch');
var CompletedExecutionsSheet = spreadsheet.getSheetByName('CompletedExecutions');
var DesktopBatchSheet = spreadsheet.getSheetByName('DesktopBatch');
var MobileBatchSheet = spreadsheet.getSheetByName('MobileBatch');


function moveDataToMasterHalfBatch(){
var counter=0;
var data1 = sheet.getDataRange().getValues();
var cutoff=(data1.length >= recordToCopyIntoMasterHalfBatch) ? recordToCopyIntoMasterHalfBatch : data1.length;
console.log("Number of Records to Copy "+ data1.length )
MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Job Started - Moving Half of Data to Master Sheet", "Started moving data to master - job started now, records available to copy: "+ cutoff);while(counter<cutoff){
if(data1[counter][6]){ // making sure there is data to copy first
    let userFullnames = data1[counter].map(function(eachCell){
      if (data1[counter][0]===eachCell )
        {
           console.log(data1[counter]);
           return  Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd");
        }
      else
        return eachCell ;
       })
    masterSheet.appendRow(userFullnames); //enter each row in master sheet
    sheet.deleteRow(1); // delete first row
    counter++; // increase counter so that it can stop at defined range
    console.log(counter);
       } else {counter=1000; //exit while loop as there are no records to copy}
         }
 }
 MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Job Finished - Moving Half of Data to Master Sheet", "Finished moving data to master, records copied: "+ cutoff);
 deleteTriggers();
}

function resetBatches(){
 var sheetM = spreadsheet.getSheetByName('MobileBatch');
 var sheetD = spreadsheet.getSheetByName('DesktopBatch');
 var mobileSheet = spreadsheet.getSheetByName('BackUpMobile');
 var desktopSheet = spreadsheet.getSheetByName('BackUpDesktop');
 spreadsheet.deleteSheet(sheetM);
 spreadsheet.deleteSheet(sheetD);

 mobileSheet.copyTo(spreadsheet).setName('MobileBatch');
 desktopSheet.copyTo(spreadsheet).setName('DesktopBatch');
 
 createTriggers()

 MailApp.sendEmail(notificationEmailId,emailSubjectOwner+"Batches and Triggers set up done ","Batches and Triggers are set up successfully for execution: ");
 
}

function oneByOneExecuteMobileUrls() {
  var rowsToRerun = MobileBatchSheet.getDataRange().getValues();
  if(rowsToRerun[0][6]){
  console.log(rowsToRerun[0][6],rowsToRerun[0][3]);
  if(rowsToRerun[0][2]=="0"){
  if (rowsToRerun[0][3]=="mobile"){
  var mobileInfo =  getPageSpeedInfo('mobile',rowsToRerun[0][6],rowsToRerun[0][1],rowsToRerun[0][4],rowsToRerun[0][5]);
  if(mobileInfo){
     try{
      insertDataToSheet(mobileInfo, 'mobile',rowsToRerun[0][6],rowsToRerun[0][4],rowsToRerun[0][5],rowsToRerun[0][1]);  
      }catch(err){
     console.log("Unable to record the result due to " +err);
     FailureSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),"FailureFromInsertion",0,'mobile',rowsToRerun[0][4],rowsToRerun[0][5],rowsToRerun[0][6]])
     MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"During 1 by 1 exec batch - insertion failed", rowsToRerun[0][6]+" "+"mobile"+" "+rowsToRerun[0][4]);
    }
   }
  }
  }
  MobileBatchSheet.getRange(1,3).setValue(1);
  var finalise = MobileBatchSheet.getDataRange().getValues();
  CompletedExecutionsSheet.appendRow(finalise[0]);
  MobileBatchSheet.deleteRow(1);  
  }
}

function oneByOneExecuteDesktopUrls() {
  var rowsToRerun = DesktopBatchSheet.getDataRange().getValues();
  if(rowsToRerun[0][6]){
  console.log(rowsToRerun[0][6],rowsToRerun[0][3]);
  if(rowsToRerun[0][2]=="0"){
  if (rowsToRerun[0][3]=="desktop"){
  var desktopInfo =  getPageSpeedInfo('desktop',rowsToRerun[0][6],rowsToRerun[0][1],rowsToRerun[0][4],rowsToRerun[0][5]);
  if(desktopInfo){
   try{
     insertDataToSheet(desktopInfo, 'desktop',rowsToRerun[0][6],rowsToRerun[0][4],rowsToRerun[0][5],rowsToRerun[0][1]);  
      }catch(err){
     console.log("Unable to record the result due to " +err);
     FailureSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),"FailureFromInsertion",0,'desktop',rowsToRerun[0][4],rowsToRerun[0][5],rowsToRerun[0][6]])
     MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"During 1 by 1 exec batch - insertion failed", rowsToRerun[0][6]+" "+"desktop"+" "+rowsToRerun[0][4]);
    }
   }
  }
  }
  DesktopBatchSheet.getRange(1,3).setValue(1);
  var finalise = DesktopBatchSheet.getDataRange().getValues();
  CompletedExecutionsSheet.appendRow(finalise[0]);
  DesktopBatchSheet.deleteRow(1);  
  }
}


function failureRerun() {
  var rowsToRerun = FailureSheet.getDataRange().getValues();
  if(rowsToRerun[0][6]){
  console.log(rowsToRerun[0][6],rowsToRerun[0][3]);

  if(rowsToRerun[0][2]==0){
  if (rowsToRerun[0][3]=="desktop"){
  var desktopInfo =  getPageSpeedInfo('desktop',rowsToRerun[0][6],rowsToRerun[0][1],rowsToRerun[0][4],rowsToRerun[0][5]);
  if(desktopInfo){
   try{
     insertDataToSheet(desktopInfo, 'desktop',rowsToRerun[0][6],rowsToRerun[0][4],rowsToRerun[0][5],"Re-Ran");  
      }catch(err){
     console.log("Unable to record the result due to " +err);
     FailureSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),"FailureFromInsertion",0,'desktop',rowsToRerun[0][4],rowsToRerun[0][5],rowsToRerun[0][6]])
     MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"During failure batch-insertion failed", rowsToRerun[0][6]+" "+"desktop"+" "+rowsToRerun[0][4]);
      }
    }
   }
  }

  if(rowsToRerun[0][2]=="0"){
  if (rowsToRerun[0][3]=="mobile"){
  var mobileInfo =  getPageSpeedInfo('mobile',rowsToRerun[0][6],rowsToRerun[0][1],rowsToRerun[0][4],rowsToRerun[0][5]);
  if(mobileInfo){ 
   try{
     insertDataToSheet(mobileInfo, 'mobile',rowsToRerun[0][6],rowsToRerun[0][4],rowsToRerun[0][5],"Re-Ran");  
      }catch(err){
       console.log("Unable to record the result due to " +err);
       FailureSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),"FailureFromInsertion",0,'mobile',rowsToRerun[0][4],rowsToRerun[0][5],rowsToRerun[0][6]])
       MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"During failure batch-insertion failed", rowsToRerun[0][6]+" "+"mobile"+" "+rowsToRerun[0][4]);
      }
     }
   }
  }
  FailureSheet.deleteRow(1);
  }
}

function getPageSpeedInfo(strategy,url,batchName,brand,app) {
  var pageSpeedUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + url + '&category=PERFORMANCE&category=SEO&category=BEST_PRACTICES&category=ACCESSIBILITY&key=' +    pageSpeedApiKey + '&strategy=' + strategy;
  try {
      var response = UrlFetchApp.fetch(pageSpeedUrl);
      var json = response.getContentText();
      console.log(JSON.parse(json));
      return JSON.parse(json);
      } catch(error){
        console.log(`Failed the url ${pageSpeedUrl}, in catch block`) 
        FailureSheet.appendRow([Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),batchName,0,strategy,brand,app,url])
      }
}

function insertDataToSheet(deviceInfo, deviceType,url,brand,app,batchName){
 
  var overallPageScore="";
    if (deviceInfo.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.category == "FAST" 
    &&  deviceInfo.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category == "FAST" 
    &&  deviceInfo.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category =="FAST" ){
      overallPageScore=1;
    }
    else 
    overallPageScore=0;

    sheet.appendRow([

 // Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd'T'HH:mm:ss"),
  Utilities.formatDate(new Date(), "GMT+1:00", "yyyy-MM-dd"),
  batchName,
  brand,
  app,
  deviceType,
  url,
  deviceInfo.lighthouseResult.categories.performance.score * 100,
  deviceInfo.lighthouseResult.audits['first-contentful-paint'].numericValue,
  deviceInfo.lighthouseResult.audits['largest-contentful-paint'].numericValue,
  deviceInfo.lighthouseResult.audits['cumulative-layout-shift'].numericValue,
  deviceInfo.lighthouseResult.audits['interactive'].numericValue,
  deviceInfo.lighthouseResult.audits['total-blocking-time'].numericValue,
  deviceInfo.lighthouseResult.audits['speed-index'].numericValue,
  deviceInfo.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile,
  deviceInfo.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.percentile,
  deviceInfo.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile,
  deviceInfo.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
  deviceInfo.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.category,
  deviceInfo.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category,
  deviceInfo.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category,
  overallPageScore,
  deviceInfo.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.distributions[0].proportion*100,
  deviceInfo.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.distributions[1].proportion*100,
  deviceInfo.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.distributions[2].proportion*100,
  deviceInfo.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.distributions[0].proportion*100,
  deviceInfo.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.distributions[1].proportion*100,
  deviceInfo.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.distributions[2].proportion*100,
  deviceInfo.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.distributions[0].proportion*100,
  deviceInfo.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.distributions[1].proportion*100,
  deviceInfo.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.distributions[2].proportion*100,
  deviceInfo.loadingExperience.overall_category,
  deviceInfo.lighthouseResult.categories.accessibility.score * 100,
  deviceInfo.lighthouseResult.categories.seo.score * 100,
  deviceInfo.lighthouseResult.categories['best-practices'].score * 100,

  
 ]);  
}

function resetDataSheetsForNextDay(){
  sheet.deleteRows(1,executionRowCount);
  sheet.insertRows(1,executionRowCount*2);

  CompletedExecutionsSheet.deleteRows(1,executionRowCount);
  CompletedExecutionsSheet.insertRows(156,executionRowCount); //reinserting delete rows so that the sheet never goes down to 0 on reset

  FailureSheet.deleteRows(1,failureRowCount);
  FailureSheet.insertRows(21,failureRowCount);

  var old_t=printAndReturnTriggers(); 
  deleteTriggers();
  var t=printAndReturnTriggers(); 
  MailApp.sendEmail(notificationEmailId, emailSubjectOwner+"Triggers Deleted, Sheets Reset", "Final Reset for the day - These were triggers before delete \n\n"+old_t+"\n\nTriggers deletion finished successfully, below are the triggers present now:\n "+t);
}