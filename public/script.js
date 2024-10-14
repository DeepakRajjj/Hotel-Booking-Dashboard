let bookings = [];
let charts = {};

function fetchBookings() {
    fetch('/api/bookings')
        .then(response => response.json())
        .then(data => {
            bookings = data;
            updateCharts();
        });
}

function updateCharts() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);

    const filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.arrival_date_year, getMonthNumber(booking.arrival_date_month) - 1, booking.arrival_date_day_of_month);
        return bookingDate >= startDate && bookingDate <= endDate;
    });

    updateVisitorsPerDay(filteredBookings);
    updateVisitorsPerCountry(filteredBookings);
    updateTotalAdults(filteredBookings);
    updateTotalChildren(filteredBookings);
}

function getMonthNumber(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(month) + 1;
}

function updateVisitorsPerDay(filteredBookings) {
    const visitorsByDay = filteredBookings.reduce((acc, booking) => {
        const date = `${booking.arrival_date_year}-${getMonthNumber(booking.arrival_date_month).toString().padStart(2, '0')}-${booking.arrival_date_day_of_month.toString().padStart(2, '0')}`;
        const totalVisitors = parseInt(booking.adults) + parseInt(booking.children) + parseInt(booking.babies);
        acc[date] = (acc[date] || 0) + totalVisitors;
        return acc;
    }, {});

    const options = {
        chart: {
            type: 'area',
            height: 350,
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        series: [{
            name: 'Visitors',
            data: Object.entries(visitorsByDay).map(([date, count]) => ({ x: new Date(date).getTime(), y: count }))
        }],
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            title: {
                text: 'Number of Visitors'
            }
        },
        colors: ['#3498db'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            }
        }
    };

    if (charts.visitorsPerDay) {
        charts.visitorsPerDay.updateOptions(options);
    } else {
        charts.visitorsPerDay = new ApexCharts(document.querySelector("#visitors-per-day"), options);
        charts.visitorsPerDay.render();
    }
}

function updateVisitorsPerCountry(filteredBookings) {
    const visitorsByCountry = filteredBookings.reduce((acc, booking) => {
        const totalVisitors = parseInt(booking.adults) + parseInt(booking.children) + parseInt(booking.babies);
        acc[booking.country] = (acc[booking.country] || 0) + totalVisitors;
        return acc;
    }, {});

    const sortedData = Object.entries(visitorsByCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const options = {
        chart: {
            type: 'bar',
            height: 350,
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        series: [{
            name: 'Visitors',
            data: sortedData.map(([, count]) => count)
        }],
        xaxis: {
            categories: sortedData.map(([country]) => country),
            labels: {
                rotate: -45,
                rotateAlways: true
            }
        },
        yaxis: {
            title: {
                text: 'Number of Visitors'
            }
        },
        colors: ['#2ecc71'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '70%',
            }
        },
        dataLabels: {
            enabled: false
        },
        title: {
            text: 'Top 10 Countries',
            align: 'center'
        }
    };

    if (charts.visitorsPerCountry) {
        charts.visitorsPerCountry.updateOptions(options);
    } else {
        charts.visitorsPerCountry = new ApexCharts(document.querySelector("#visitors-per-country"), options);
        charts.visitorsPerCountry.render();
    }
}

function updateTotalAdults(filteredBookings) {
    const totalAdults = filteredBookings.reduce((sum, booking) => sum + parseInt(booking.adults), 0);
    document.getElementById('total-adults-value').textContent = totalAdults;

    const adultsByDay = filteredBookings.reduce((acc, booking) => {
        const date = `${booking.arrival_date_year}-${getMonthNumber(booking.arrival_date_month).toString().padStart(2, '0')}-${booking.arrival_date_day_of_month.toString().padStart(2, '0')}`;
        acc[date] = (acc[date] || 0) + parseInt(booking.adults);
        return acc;
    }, {});

    const options = {
        chart: {
            type: 'area',
            height: 100,
            sparkline: {
                enabled: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        series: [{
            name: 'Adults',
            data: Object.values(adultsByDay)
        }],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            opacity: 0.3
        },
        colors: ['#3498db']
    };

    if (charts.adultsSparkline) {
        charts.adultsSparkline.updateOptions(options);
    } else {
        charts.adultsSparkline = new ApexCharts(document.querySelector("#adults-sparkline"), options);
        charts.adultsSparkline.render();
    }
}

function updateTotalChildren(filteredBookings) {
    const totalChildren = filteredBookings.reduce((sum, booking) => sum + parseInt(booking.children), 0);
    document.getElementById('total-children-value').textContent = totalChildren;

    const childrenByDay = filteredBookings.reduce((acc, booking) => {
        const date = `${booking.arrival_date_year}-${getMonthNumber(booking.arrival_date_month).toString().padStart(2, '0')}-${booking.arrival_date_day_of_month.toString().padStart(2, '0')}`;
        acc[date] = (acc[date] || 0) + parseInt(booking.children);
        return acc;
    }, {});

    const options = {
        chart: {
            type: 'area',
            height: 100,
            sparkline: {
                enabled: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        series: [{
            name: 'Children',
            data: Object.values(childrenByDay)
        }],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            opacity: 0.3
        },
        colors: ['#2ecc71']
    };

    if (charts.childrenSparkline) {
        charts.childrenSparkline.updateOptions(options);
    } else {
        charts.childrenSparkline = new ApexCharts(document.querySelector("#children-sparkline"), options);
        charts.childrenSparkline.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    startDateInput.value = '2015-07-01';
    endDateInput.value = '2015-08-31';

    startDateInput.addEventListener('change', updateCharts);
    endDateInput.addEventListener('change', updateCharts);

    fetchBookings();
});
