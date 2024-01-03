// Create a global variable to store the sheet ID
var sheetId = "YOUR_SHEET_ID";

// Your Slack webhook URL
 var slackWebhookUrl = "YOUR_SLACKWEBHOOK_URL";



// Function to handle incoming webhook events
function doPost(e) {
  var eventData = JSON.parse(e.postData.contents);

  // Process the event data and add a new row to the Google Sheet
  addToGoogleSheet(eventData);

  // Call the API with the event data
  // callApi(eventData);

  // Send data to Slack channel
  sendToSlackChannel(eventData);

  // Respond to Tally.so with a success message
  return ContentService.createTextOutput("Webhook received successfully");
}

// Function to add a new row to the Google Sheet
function addToGoogleSheet(data) {
  var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

  // Extracting data from the webhook JSON
  var createdAt = data.data.createdAt; // Extracting createdAt field
  var name = getFieldAnswer(data, "question_VLK5Jg");
  var imagePdfUrl = getFieldAnswer(data, "question_Pd75OV")[0].url;
  var obdScanReportUrl = getFieldAnswer(data, "question_Ek2QW4")[0].url;
  var phoneNumber = getFieldAnswer(data, "question_rjeAPN");

  // Populate the array with the extracted data
  var values = [createdAt, name, imagePdfUrl, obdScanReportUrl, phoneNumber];

  // Add a new row to the Google Sheet
  sheet.appendRow(values);
}

// Function to call an API with the event data
function callApi(data) {
  var apiUrl = "YOUR_API_ENDPOINT_URL";

  // Prepare the payload for the API request
  var payload = {
    data: data
    // Add more properties as needed based on your API requirements
  };

  // Make a POST request to the API
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(apiUrl, options);
}

// Function to send data to Slack channel
function sendToSlackChannel(eventData) {
 
  var toemail = "ali.sorathiya@cafu.com";

  // Extracting data from the webhook JSON
  var createdAt = eventData.data.createdAt; // Extracting createdAt field
  var name = getFieldAnswer(eventData, "question_VLK5Jg");
  var imagePdfUrl = getFieldAnswer(eventData, "question_Pd75OV")[0].url;
  var obdScanReportUrl = getFieldAnswer(eventData, "question_Ek2QW4")[0].url;
  var phoneNumber = getFieldAnswer(eventData, "question_rjeAPN");

  // Creating Slack payload
  var slackPayload = {
    "text": "New Vehicle Inspection Report",
    "username": "VI Notifications Bot - Ali",
    "icon_url": "https://cdn-icons-png.flaticon.com/128/4201/4201973.png",
    "attachments": [
      {
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Name:* ${name}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Phone Number:* ${phoneNumber}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Created At:* ${createdAt}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Attachments:*"
            },
            "accessory": {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "View PDF Reports ↗️"
              },
              "url": obdScanReportUrl // Assuming this is the URL to view PDF reports
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*PDF Image:*"
            },
            "accessory": {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "View PDF Image ↗️"
              },
              "url": imagePdfUrl
            }
          }
        ]
      }
    ]
  };

  // Sending data to Slack channel
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(slackPayload)
  };

  var response = UrlFetchApp.fetch(slackWebhookUrl, options);

  if (response.getResponseCode() == 200) {
    Logger.log("Message sent to Slack channel successfully.");
  } else {
    Logger.log("Error sending message to Slack channel. Response code: " + response.getResponseCode());
  }
}

// Helper function to get the answer for a specific question key
function getFieldAnswer(data, fieldKey) {
  var field = data.data.fields.find(function (item) {
    return item.key === fieldKey;
  });

  return field ? field.value : null;
}
