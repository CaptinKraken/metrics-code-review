import {powerData, loadData, trafficData} from './data';

const REST = {
  retrieve: (url, data) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.type.toLowerCase() === 'power') resolve(powerData);
        else if (data.type.toLowerCase() === 'load') resolve(loadData);
        else if (data.type.toLowerCase() === 'traffic')
          resolve(trafficData);
        else resolve([]);
      }, 300);
    }),
};

export default REST;
export { REST };
