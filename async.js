'use strict';

exports.isStar = true;
exports.runParallel = runParallel;


/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise(resolve => {
        if (!jobs.length) {
            resolve([]);
        }
        const jobsCount = jobs.length;
        let jobIndex = 0;
        const results = [];
        for (jobIndex; jobIndex < parallelNum; jobIndex++) {
            start(jobs.shift(), jobIndex);
        }

        function processResult(result, counter) {
            results[counter] = result;
            if (Object.keys(results).length === jobsCount) {
                resolve(results);

                return;
            }
            if (jobs.length) {
                start(jobs.shift(), jobIndex);
                jobIndex++;
            }
        }

        function start(job, counter) {
            let process = result => processResult(result, counter);
            new Promise((resolveJob, rejectJob) => {
                job().then(resolveJob, rejectJob);
                setTimeout(rejectJob, timeout, new Error('Promise timeout'));
            }).then(process, process);
        }
    });
}
