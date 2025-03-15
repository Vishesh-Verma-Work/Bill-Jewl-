let ganthhList = [];
const REFERENCE_DATE = new Date(2025, 1, 1); // February 1, 2025

function formatDate(day, month, year) {
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/20${year.toString().padStart(2, '0')}`;
}

function calculateDaysDifference(endDate) {
    const today = new Date();
    
    // Convert dates to year, month, day components
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();
    
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    // Calculate difference using 30-day months (360-day year)
    const yearDiff = todayYear - endYear;
    const monthDiff = todayMonth - endMonth;
    const dayDiff = todayDay - endDay;
    
    // Total days = (years * 360) + (months * 30) + days
    return Math.abs((yearDiff * 360) + (monthDiff * 30) + dayDiff);
}

function calculateInterest(amount, days, date) {
    const endDate = new Date(2000 + parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day));
    const isAfterReferenceDate = endDate > REFERENCE_DATE;
    const rate = isAfterReferenceDate ? 1.25 : 1;
    const compoundPeriod = isAfterReferenceDate ? 720 : 360; // 2 years or 1 year in days

    let totalInterest = 0;
    let principal = amount;
    let remainingDays = days;
    let breakdown = [];

    if (days <= compoundPeriod) {
        // Simple interest for less than compound period
        const dailyRate = rate / 30;
        totalInterest = (principal * dailyRate * days) / 100;
        breakdown.push({
            period: `First ${days} days`,
            interest: totalInterest,
            type: 'Simple',
            class: 'first-period'
        });
    } else {
        // Compound interest calculation
        let periodCount = Math.floor(days / compoundPeriod);
        let extraDays = days % compoundPeriod;

        // First period (simple interest)
        let firstPeriodInterest = (principal * rate * compoundPeriod) / (30 * 100);
        totalInterest += firstPeriodInterest;
        breakdown.push({
            period: `First ${compoundPeriod} days`,
            interest: firstPeriodInterest,
            type: 'Simple',
            class: 'first-period'
        });

        // Subsequent periods (compound interest)
        for (let i = 1; i < periodCount; i++) {
            principal += firstPeriodInterest;
            let periodInterest = (principal * rate * compoundPeriod) / (30 * 100);
            totalInterest += periodInterest;
            breakdown.push({
                period: `${i + 1}${getOrdinalSuffix(i + 1)} period (${compoundPeriod} days)`,
                interest: periodInterest,
                type: 'Compound',
                class: 'compound-period'
            });
            firstPeriodInterest = periodInterest;
        }

        // Remaining days
        if (extraDays > 0) {
            principal += firstPeriodInterest;
            let remainingInterest = (principal * rate * extraDays) / (30 * 100);
            totalInterest += remainingInterest;
            breakdown.push({
                period: `Remaining ${extraDays} days`,
                interest: remainingInterest,
                type: 'Compound',
                class: 'remaining-period'
            });
        }
    }

    return {
        total: totalInterest,
        breakdown: breakdown,
        isAfterReferenceDate: isAfterReferenceDate,
        rate: rate
    };
}

function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}

function validateInputs() {
    const ganthhNumber = document.getElementById('ganthhNumber').value;
    const endDay = document.getElementById('endDay').value;
    const endMonth = document.getElementById('endMonth').value;
    const endYear = document.getElementById('endYear').value;
    const ganthhAmount = document.getElementById('ganthhAmount').value;

    if (!ganthhNumber || !endDay || !endMonth || !endYear || !ganthhAmount) {
        alert('Please fill all fields');
        return false;
    }

    if (ganthhNumber < 1 || ganthhNumber > 9999) {
        alert('Ganthh number must be between 1 and 9999');
        return false;
    }

    if (endDay < 1 || endDay > 30 || endMonth < 1 || endMonth > 12 || endYear < 0 || endYear > 99) {
        alert('Please enter valid date');
        return false;
    }

    if (ganthhAmount <= 0) {
        alert('Please enter valid amount');
        return false;
    }

    return true;
}

function addGanthh() {
    if (!validateInputs()) return;

    const ganthh = {
        number: document.getElementById('ganthhNumber').value,
        date: {
            day: document.getElementById('endDay').value,
            month: document.getElementById('endMonth').value,
            year: document.getElementById('endYear').value
        },
        amount: parseFloat(document.getElementById('ganthhAmount').value)
    };

    ganthhList.push(ganthh);
    updateGanthhList();
    clearInputs();
}

function clearInputs() {
    document.getElementById('ganthhNumber').value = '';
    document.getElementById('endDay').value = '';
    document.getElementById('endMonth').value = '';
    document.getElementById('endYear').value = '';
    document.getElementById('ganthhAmount').value = '';
}

function clearBill() {
    ganthhList = [];
    document.getElementById('ganthhList').innerHTML = '';
    document.getElementById('billOutput').innerHTML = '';
}

function updateGanthhList() {
    const listElement = document.getElementById('ganthhList');
    listElement.innerHTML = ganthhList.map((ganthh, index) => `
        <div class="ganthh-item">
            <div>Ganthh Number: ${ganthh.number}</div>
            <div>End Date: ${formatDate(ganthh.date.day, ganthh.date.month, ganthh.date.year)}</div>
            <div>Amount: ₹${ganthh.amount.toLocaleString()}</div>
        </div>
    `).join('');
}

function createBill() {
    if (ganthhList.length === 0) {
        alert('Please add at least one ganthh');
        return;
    }

    const today = new Date();
    let totalAmount = 0;
    let totalInterest = 0;

    const billContent = `
        <div class="bill-container" id="billForDownload">
            <div class="bill-header">
                <div class="bill-date">${today.toLocaleDateString('en-IN')}</div>
            </div>

            <div class="interest-description">
                <p><strong>Interest Calculation:</strong></p>
                <p>• Before 01/02/2025: 1% interest with yearly (360 days) compound interest</p>
                <p>• After 01/02/2025: 1.25% interest with 2-yearly (720 days) compound interest</p>
            </div>

            <table class="bill-table">
                ${ganthhList.map(ganthh => {
                    const endDate = new Date(2000 + parseInt(ganthh.date.year), parseInt(ganthh.date.month) - 1, parseInt(ganthh.date.day));
                    const daysDiff = calculateDaysDifference(endDate);
                    const interestCalc = calculateInterest(ganthh.amount, daysDiff, ganthh.date);
                    
                    totalAmount += ganthh.amount;
                    totalInterest += interestCalc.total;

                    return `
                        <tr>
                            <td>
                                <strong>Ganthh #${ganthh.number}</strong><br>
                                Days Difference: ${daysDiff}
                            </td>
                            <td>
                                Amount: ₹${ganthh.amount.toLocaleString()}<br>
                                End Date: ${formatDate(ganthh.date.day, ganthh.date.month, ganthh.date.year)}<br>
                                Interest Rate: ${interestCalc.rate}%
                                <div class="interest-breakdown">
                                    ${interestCalc.breakdown.map(b => `
                                        <div class="${b.class}">${b.period}: ₹${b.interest.toLocaleString(undefined, {maximumFractionDigits: 2})} (${b.type})</div>
                                    `).join('')}
                                </div>
                            </td>
                            <td>
                                Total Interest: ₹${interestCalc.total.toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </table>

            <div class="bill-summary">
                <p>Total Ganthh Amount: ₹${totalAmount.toLocaleString()}</p>
                <p>Total Interest: ₹${totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Grand Total: ₹${(totalAmount + totalInterest).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>

            <div class="action-buttons">
                <button class="download-btn" onclick="downloadBill()">Download Bill</button>
            </div>
        </div>
    `;

    document.getElementById('billOutput').innerHTML = billContent;
}

async function downloadBill() {
    const billElement = document.getElementById('billForDownload');
    try {
        const canvas = await html2canvas(billElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        const link = document.createElement('a');
        link.download = 'bill.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Error generating image:', error);
        alert('Error generating bill image. Please try again.');
    }
}
