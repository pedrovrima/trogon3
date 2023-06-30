// BEGIN: ed8c6549bwf9
    .query(async ({ input }) => {

            const {initialBandNumber, finalBandNumber, bandSize} = input

            const initial = parseInt(initialBandNumber, 10);
            const final = parseInt(finalBandNumber, 10);

            if (initial > final) {
              throw new Error("initialBandNumber must be smaller than finalBandNumber");
            }

            for (let i = initial; i <= final; i++) {
              const paddedNumber = i.toString().padStart(2, "0");
              if (parseInt(paddedNumber, 10) > 50) {
                throw new Error(`Band number ${paddedNumber} is greater than 50`);
              }
            }

            return {
                band_captures,
          
            };
        }),
// END: ed8c6549bwf9