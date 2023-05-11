const REST = {
  retrieve: (url, data) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.type.toLowerCase() === 'power') resolve(['1', '2', '3']);
        else if (data.type.toLowerCase() === 'load') resolve(['4', '5', '6']);
        else if (data.type.toLowerCase() === 'traffic')
          resolve(['7', '8', '9']);
        else resolve([]);
      }, 300);
    }),
};

export default REST;
export { REST };
