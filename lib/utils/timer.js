import moment from "moment";
/**
 *   检测是否时间重合

 * @param {Array} setFormTimeRangs //检测重复时间段列表

 * @return {Boolean}
 */
export function isTimeRangeRepeat(setFormTimeRangs) {
  let isRepeat = false;
  setFormTimeRangs.map((timeIntervalO1, i1) => {
    setFormTimeRangs.map((timeIntervalO2, i2) => {
      if (
        i1 != i2 &&
        !(
          moment(timeIntervalO1.endTime).isBefore(timeIntervalO2.startTime) ||
          moment(timeIntervalO1.startTime).isAfter(timeIntervalO2.endTime)
        )
      ) {
        isRepeat = true;
      }
    });
  });

  return isRepeat;
}

const timerMap = {

};
/**
 *
 *
 * @export    预防频繁调用
 * @param {String} key   key标识
 * @param {Function} func  执行的方法
 * @param {Number} timer 间隔的时间秒
 */
export function setTimer(key, func, timer) {
  if (!timerMap[key] || (timerMap[key] && (new Date()).valueOf() - timerMap[key] > timer * 1000)) {
    func();
    timerMap[key] = (new Date()).valueOf();
  }
}
