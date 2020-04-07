// Elements
const $startDate_1 = document.getElementById("section-1-start");
const $endDate_1 = document.getElementById("section-1-end");

const todayDate = moment().format("YYYY-MM-DD");
const threeDaysAgoDate = moment().subtract(3, "days").format("YYYY-MM-DD");
$startDate_1.value = threeDaysAgoDate;
$endDate_1.value = todayDate;
