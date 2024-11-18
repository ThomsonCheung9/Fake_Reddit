//#region Function for handling post.js
export const postIDToCommunity = function(postID, communitiesModel) {
    const model = communitiesModel;
    for(let i=0; i<model.length; i++) {
      for(let j=0; j<model[i].postIDs.length; j++) {
        if (model[i].postIDs[j]._id == postID) {
          return model[i].name;
        }
      }
    }
    return "Unknown";
}

export const matchLinkFlair = function(linkFlairID, linkflairsModel) {
    const modelLinkFlair = linkflairsModel;
    for(let i = 0; i<modelLinkFlair.length; i++) {
      if (linkFlairID._id == modelLinkFlair[i]._id) {
        return modelLinkFlair[i].content;
      }
    }
}

export const orderComment = function(orderStr, commentArray) {
  let newArray = commentArray.map(comment => ({
    original: comment,
    date: new Date(comment.commentedDate)
  }));
  if (orderStr == "Newest") {
    newArray.sort(sortCommentNewest);
  } else {
    newArray.sort(sortCommentOldest);
  }
  let resultArray = newArray.map(dataPoint => dataPoint.original);
  return resultArray;
}

const sortCommentNewest = (date1, date2) => {
  return date2.date.getTime() - date1.date.getTime();
}

const sortCommentOldest = (date1, date2) => {
  return date1.date.getTime() - date2.date.getTime();
}


//#region Count # of comments
//This gets the entire comments objects of all the comments in post
export const getCommentsInPost = function(postID, postsModel, commentsModel) {
  const modelPost = postsModel.find(p => p._id == postID);
  return modelPost ? recGetComments(modelPost.commentIDs, commentsModel) : [];
};

function recGetComments(commentIDs, commentsModel) {
  let result = [];
  commentIDs.forEach(id => {
      // Find the comment by ID in commentsModel
      const comment = commentsModel.find(c => c._id == id);
      if (comment) {
          result.push(comment);
          // Recursively gather nested comments by calling recGetComments with comment's commentIDs
          result = result.concat(recGetComments(comment.commentIDs, commentsModel));
      }
  });
  return result;
}

//#endregion
//#endregion

export const calculateTimeDifference = function(timeStr) {
    const givenDate = new Date(timeStr);
    const currentDate = new Date();
    const differenceInMillis = currentDate - givenDate;
    const differenceInSeconds = Math.floor(differenceInMillis / 1000);
    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} second(s) ago`;
    } else if (differenceInSeconds < 3600) {
      const differenceInMinutes = Math.floor(differenceInSeconds / 60);
      return `${differenceInMinutes} minute(s) ago`;
    } else if (differenceInSeconds < 86400) {
      const differenceInHours = Math.floor(differenceInSeconds / 3600);
      return `${differenceInHours} hour(s) ago`;
    } else {
      let yearsDifference = currentDate.getFullYear() - givenDate.getFullYear();
      let monthsDifference = currentDate.getMonth() - givenDate.getMonth();
      const differenceInDays = Math.floor(differenceInSeconds / 86400);
      
      if (monthsDifference < 0) {
        yearsDifference--;
        monthsDifference += 12; // Add 12 to normalize the negative month difference
      }
    
      if (yearsDifference <= 0 && monthsDifference <= 0) {
        return `${differenceInDays} day(s) ago`;
      } else if (yearsDifference <= 0) {
        return `${monthsDifference} month(s) ago`;
      } else {
        return `${yearsDifference} year(s) ago`;
      }
    }
}