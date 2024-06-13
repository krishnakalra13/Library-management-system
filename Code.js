
    function doGet(e) {
        return handleRequest(e);
      }
      
      function doPost(e) {
        return handleRequest(e);
      }
      
      function handleRequest(e) {
        if (!e || !e.parameter) {
          return ContentService.createTextOutput(
            "No parameters provided"
          ).setMimeType(ContentService.MimeType.TEXT);
        }
      
        var action = e.parameter.action;
        var params = e.parameter;
      
        switch (action) {
          case "addBook":
            return addBook(params.bookID, params.title, params.author, params.copies);
          case "addUser":
            return addUser(params.userID, params.name, params.email);
          case "borrowBook":
            return borrowBook(
              params.bookIDBorrow,
              params.userIDBorrow,
              params.borrowDate,
              params.dueDate
            );
          case "returnBook":
            return returnBook(params.borrowID, params.returnDate);
          case "listBooks":
            return listBooks();
          case "listUsers":
            return listUsers();
          case "listBorrowedBooks":
            return listBorrowedBooks();
          default:
            return ContentService.createTextOutput("Invalid action").setMimeType(
              ContentService.MimeType.TEXT
            );
        }
      }
      
      function addBook(bookID, title, author, copies) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Books");
        sheet.appendRow([bookID, title, author, copies, copies]);
        return ContentService.createTextOutput("Book added successfully").setMimeType(
          ContentService.MimeType.TEXT
        );
      }
      
      function addUser(userID, name, email) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
        sheet.appendRow([userID, name, email]);
        return ContentService.createTextOutput("User added successfully").setMimeType(
          ContentService.MimeType.TEXT
        );
      }
      
      function borrowBook(bookID, userID) {
        var booksSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Books");
        var borrowedSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Borrowed");
      
        var booksData = booksSheet.getDataRange().getValues();
        for (var i = 1; i < booksData.length; i++) {
          if (booksData[i][0] == bookID && booksData[i][3] > 0) {
            booksSheet.getRange(i + 1, 4).setValue(booksData[i][3] - 1);
      
            var borrowDate = new Date();
            var dueDate = new Date();
            dueDate.setDate(borrowDate.getDate() + 14); // Loan period of 14 days
      
            borrowedSheet.appendRow([
              borrowedSheet.getLastRow() + 1,
              bookID,
              userID,
              borrowDate,
              dueDate,
              "",
              0,
            ]);
            return ContentService.createTextOutput(
              "Book borrowed successfully"
            ).setMimeType(ContentService.MimeType.TEXT);
          }
        }
        return ContentService.createTextOutput("Book not available").setMimeType(
          ContentService.MimeType.TEXT
        );
      }
      
      function returnBook(borrowID) {
        var booksSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Books");
        var borrowedSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Borrowed");
      
        var borrowedData = borrowedSheet.getDataRange().getValues();
        for (var i = 1; i < borrowedData.length; i++) {
          if (borrowedData[i][0] == borrowID) {
            var bookID = borrowedData[i][1];
            var dueDate = new Date(borrowedData[i][4]);
            var returnDate = new Date();
            var fee = 0;
      
            if (returnDate > dueDate) {
              var daysLate = Math.ceil((returnDate - dueDate) / (1000 * 3600 * 24));
              fee = daysLate * 1; // Assuming rs50 per day week fee
            }
      
            borrowedSheet.getRange(i + 1, 6).setValue(returnDate);
            borrowedSheet.getRange(i + 1, 7).setValue(fee);
      
            var booksData = booksSheet.getDataRange().getValues();
            for (var j = 1; j < booksData.length; j++) {
              if (booksData[j][0] == bookID) {
                booksSheet.getRange(j + 1, 4).setValue(booksData[j][3] + 1);
                break;
              }
            }
            return ContentService.createTextOutput(
              "Book returned successfully. Fee: $" + fee
            ).setMimeType(ContentService.MimeType.TEXT);
          }
        }
        return ContentService.createTextOutput("Borrow record not found").setMimeType(
          ContentService.MimeType.TEXT
        );
      }
      
      function listBooks() {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Books");
        var data = sheet.getDataRange().getValues();
        var books = [];
        for (var i = 1; i < data.length; i++) {
          books.push({
            bookID: data[i][0],
            title: data[i][1],
            author: data[i][2],
            copiesAvailable: data[i][3],
            totalCopies: data[i][4],
          });
        }
        return ContentService.createTextOutput(JSON.stringify(books)).setMimeType(
          ContentService.MimeType.JSON
        );
      }
      
      function listUsers() {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
        var data = sheet.getDataRange().getValues();
        var users = [];
        for (var i = 1; i < data.length; i++) {
          users.push({
            userID: data[i][0],
            name: data[i][1],
            email: data[i][2],
          });
        }
        return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(
          ContentService.MimeType.JSON
        );
      }
      
      function listBorrowedBooks() {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Borrowed");
        var data = sheet.getDataRange().getValues();
      
        var borrowedBooks = [];
        for (var i = 1; i < data.length; i++) {
          borrowedBooks.push({
            borrowID: data[i][0],
            bookID: data[i][1],
            userID: data[i][2],
            returnDate: data[i][5],
          });
        }
        return ContentService.createTextOutput(
          JSON.stringify(borrowedBooks)
        ).setMimeType(ContentService.MimeType.JSON);
      }
      

