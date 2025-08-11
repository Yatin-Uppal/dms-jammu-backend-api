exports.formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) {
    return ""; // Return an empty string for empty input
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ""; // Return an empty string for invalid date input
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

exports.formatTime = (begin, end) => {
  const startTime = new Date(begin);
  const endTime = new Date(end);

  const timeDifference = endTime - startTime;

  const secondsDifference = timeDifference / 1000;

  const days = Math.floor(secondsDifference / 86400);
  const hours = Math.floor((secondsDifference % 86400) / 3600);
  const minutes = Math.floor((secondsDifference % 3600) / 60);
  const seconds = Math.floor(secondsDifference % 60);

  const formattedDuration = `${days > 0 ? days + " days " : ""}${
    hours > 0 || days > 0 ? hours.toString().padStart(2, "0") + " hours " : ""
  }${
    minutes > 0 || hours > 0 || days > 0
      ? minutes.toString().padStart(2, "0") + " minutes "
      : ""
  }${seconds.toString().padStart(2, "0") + " seconds"}`;

  return formattedDuration;
};

// Helper function to parse duration in HH:MM format to minutes
exports.parseDuration = (secondsDifference) => {
  const days = Math.floor(secondsDifference / 86400);
  const hours = Math.floor((secondsDifference % 86400) / 3600);
  const minutes = Math.floor((secondsDifference % 3600) / 60);
  const seconds = Math.floor(secondsDifference % 60);

  const formattedDuration = `${days > 0 ? days + " days " : ""}${
    hours > 0 || days > 0 ? hours.toString().padStart(2, "0") + " hours " : ""
  }${
    minutes > 0 || hours > 0 || days > 0
      ? minutes.toString().padStart(2, "0") + " minutes "
      : ""
  }${seconds.toString().padStart(2, "0") + " seconds"}`;

  return formattedDuration;
};

exports.calculateDurationInSeconds = (begin, end) => {
  const startTime = new Date(begin);
  const endTime = new Date(end);

  const timeDifference = endTime - startTime;

  const secondsDifference = timeDifference / 1000;

  return secondsDifference;
};

exports.formatexcelFileTime = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
};
