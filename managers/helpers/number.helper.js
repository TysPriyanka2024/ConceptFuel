module.exports = {
    convertNumberToWords: (number) => {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
        function convertBelowThousand(num) {
            if (num === 0) {
                return '';
            } else if (num < 10) {
                return units[num];
            } else if (num < 20) {
                return teens[num - 11];
            } else if (num < 100) {
                return `${tens[Math.floor(num / 10)]} ${convertBelowThousand(num % 10)}`;
            } else {
                return `${units[Math.floor(num / 100)]} Hundred ${convertBelowThousand(num % 100)}`;
            }
        }
    
        function convertPaiseToWords(paise) {
            if (paise === 0) {
                return 'Zero Paise';
            } else {
                return `and ${convertBelowThousand(paise)} Paise Only`;
            }
        }
    
        if (number === 0) {
            return 'Zero Only';
        }
    
        const crore = Math.floor(number / 10000000);
        const lakh = Math.floor((number % 10000000) / 100000);
        const thousand = Math.floor((number % 100000) / 1000);
        const remaining = number % 1000;
        const paise = Math.floor((remaining - Math.floor(remaining)) * 100);
    
        let result = '';
    
        if (crore > 0) {
            result += `${convertBelowThousand(crore)} Crore `;
        }
    
        if (lakh > 0) {
            result += `${convertBelowThousand(lakh)} Lakh `;
        }
    
        if (thousand > 0) {
            result += `${convertBelowThousand(thousand)} Thousand `;
        }
    
        if (remaining > 0) {
            result += `${convertBelowThousand(Math.floor(remaining))} and `;
        }
    
        result += convertPaiseToWords(paise);
    
        return result.trim();
    }
  };
  