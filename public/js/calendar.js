document.addEventListener('DOMContentLoaded', () => {
  let selectedDate = null;
  let calendar = document.querySelector('.calendar');
  const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let periodLogs = [];

  // Check leap year
  isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0);
  };

  // Get the number of days in February
  getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28;
  };

  // Log period date to periodlogs and highlight on calendar
  logPeriodDate = (date, month, year) => {
    let periodLog = {
      date: date,
      loggedDate: new Date(),
    };
    periodLogs.push(periodLog);

    let calendarDays = document.querySelectorAll('.calendar-day-hover');
    calendarDays.forEach(day => {
      const dayDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-${String(day.innerHTML).padStart(2, '0')}`;
      if (dayDate === `${year}-${String(Number(month) + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`) {
        day.classList.add('logged-period');
        console.log(`Applied logged-period to day ${date} (${dayDate})`);
      }
    });
  };

  // Generate the calendar
  generateCalendar = async (month, year) => {
    let calendar_days = calendar.querySelector('.calendar-days');
    let calendar_header_year = calendar.querySelector('#year');
    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    calendar_days.innerHTML = ''; // Clear previous days

    let currDate = new Date();
    if (month == null) month = currDate.getMonth();
    if (!year) year = currDate.getFullYear();

    let curr_month = `${month_names[month]}`;
    month_picker.innerHTML = curr_month;
    calendar_header_year.innerHTML = year;

    let first_day = new Date(year, month, 1);
    let startingDay = first_day.getDay(); // Sunday = 0, Monday = 1, etc.

    // Fetch logged periods
    let loggedPeriods = await fetchLoggedPeriods();
    console.log('Logged periods:', loggedPeriods);

    // Generate calendar days
    for (let i = 0; i < days_of_month[month] + startingDay; i++) {
      let day = document.createElement('div');
      if (i < startingDay) {
        // Add empty placeholders for days before the first of the month
        day.classList.add('calendar-day-placeholder');
        day.innerHTML = '';
      } else {
        // Add actual days
        let dateNumber = i - startingDay + 1;
        day.classList.add('calendar-day-hover');
        day.innerHTML = dateNumber;
        day.dataset.date = dateNumber; // Store date for click events
        day.dataset.month = month;
        day.dataset.year = year;

        // Format date as YYYY-MM-DD for comparison
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNumber).padStart(2, '0')}`;

        // Highlight logged periods
        if (loggedPeriods.includes(dateStr)) {
          day.classList.add('logged-period');
          console.log(`Highlighted ${dateStr} as logged-period`);
        }

        // Highlight current date
        if (dateNumber === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
          day.classList.add('curr-date');
        }

        // Click event for selecting a date
        day.onclick = () => {
          if (selectedDate) {
            selectedDate.classList.remove('selected-date');
          }
          day.classList.add('selected-date');
          selectedDate = day;
        };
      }
      calendar_days.appendChild(day);
    }

    // Update predictions and background
    await updateCalendarWithPredictions();
  };

  let month_picker = calendar.querySelector('.month-picker');
  let month_list = calendar.querySelector('.month-list');
  let currDate = new Date();
  let curr_month = currDate.getMonth();
  let curr_year = currDate.getFullYear();

  // Validate DOM elements
  if (!month_picker || !month_list) {
    console.error('Month picker or month list not found');
    return;
  }

  month_names.forEach((month, index) => {
    let monthDiv = document.createElement('div');
    monthDiv.innerHTML = month;
    monthDiv.onclick = () => {
      console.log(`Selected month: ${month}`);
      curr_month = index;
      generateCalendar(curr_month, curr_year);
      month_picker.innerHTML = month;
      month_list.classList.remove('show');
    };
    month_list.appendChild(monthDiv);
  });

  month_picker.onclick = () => {
    console.log('Month picker clicked');
    month_list.classList.toggle('show');
    month_list.scrollTop = 0;
  };

  document.addEventListener('click', (event) => {
    if (!month_picker.contains(event.target) && !month_list.contains(event.target)) {
      console.log('Closing month list');
      month_list.classList.remove('show');
    }
  });

  generateCalendar(curr_month, curr_year);

  document.querySelector('#prev-year').onclick = () => {
    --curr_year;
    generateCalendar(curr_month, curr_year);
  };

  document.querySelector('#next-year').onclick = () => {
    ++curr_year;
    generateCalendar(curr_month, curr_year);
  };

  // Profile dropdown toggle
  const profileToggle = document.getElementById("profile-toggle");
  const profileDropdown = document.getElementById("profile-dropdown");

  profileToggle.addEventListener("click", () => {
    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    if (!profileToggle.contains(event.target) && !profileDropdown.contains(event.target)) {
      profileDropdown.style.display = "none";
    }
  });

  // Log Period Button Event Listener
  const logButton = document.querySelector('.log-date-btn');

  logButton.addEventListener('click', async () => {
    if (!window.userId) {
      alert("Please log in to log a period.");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date before logging.");
      return;
    }

    const day = selectedDate.dataset.date;
    const month = selectedDate.dataset.month;
    const year = selectedDate.dataset.year;

    if (!day || !month || !year) {
      alert("Invalid date selected.");
      return;
    }

    const selectedFullDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const selectedDateObj = new Date(selectedFullDate);

    if (isNaN(selectedDateObj)) {
      alert("Invalid date selected.");
      return;
    }

    try {
      const response = await fetch(`/api/periods/last`);
      if (!response.ok) throw new Error('Failed to fetch last period');
      const lastLog = await response.json();

      if (!lastLog || !lastLog.period_start_date) {
        await logPeriod(selectedFullDate, 28);
        logPeriodDate(Number(day), month, year);
        alert("First period logged.");
      } else {
        const lastDate = new Date(lastLog.period_start_date);
        const diffDays = Math.floor((selectedDateObj - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays >= 14) {
          await logPeriod(selectedFullDate, 28);
          logPeriodDate(Number(day), month, year);
          alert("Period logged. New cycle started.");
        } else if (diffDays >= 0) {
          await logDailyPeriod(selectedFullDate);
          logPeriodDate(Number(day), month, year);
          alert("Period day logged.");
        } else {
          alert("Selected date is before your last period. Please select a valid day.");
        }
      }

      // Refresh calendar with updated highlights and predictions
      await generateCalendar(curr_month, curr_year);
    } catch (error) {
      console.error("Error logging period:", error);
      alert("Something went wrong. Please try again.");
    }
  });

  async function logPeriod(date, cycleLength) {
    const response = await fetch('/api/periods/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        period_start_date: date,
        cycle_length: cycleLength,
      }),
    });

    const result = await response.json();
    console.log('Backend response:', result);
    if (!response.ok) {
      throw new Error(result.error || 'Failed to log period');
    }
  }

  async function logDailyPeriod(date) {
    const response = await fetch('/api/periods/log/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: date,
      }),
    });

    const result = await response.json();
    console.log('Backend response for daily log:', result);
    if (!response.ok) {
      throw new Error(result.error || 'Failed to log daily period');
    }
  }

  async function fetchLoggedPeriods() {
    try {
      const response = await fetch('/api/periods/logged');
      if (!response.ok) throw new Error('Failed to fetch logged periods');
      const data = await response.json();
      console.log('Fetched logged periods (raw):', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching logged periods:', error);
      return [];
    }
  }

  async function updateCalendarWithPredictions() {
    try {
      const response = await fetch('/api/periods/calendar-data');
      if (!response.ok) throw new Error('Failed to fetch calendar data');
      const data = await response.json();
      console.log('Calendar data:', data);

      // Update day highlights without clearing existing content
      const calendarDays = document.querySelectorAll('.calendar-day-hover');
      console.log('Calendar days found:', calendarDays.length);
      calendarDays.forEach(day => {
        // Remove previous prediction highlights to avoid overlap
        day.classList.remove('predicted-period', 'ovulation-day');
        const date = `${curr_year}-${String(curr_month + 1).padStart(2, '0')}-${String(day.innerHTML).padStart(2, '0')}`;
        if (data.predictedPeriods?.includes(date)) {
          day.classList.add('predicted-period');
          console.log(`Applied predicted-period to ${date}`);
        }
        if (data.ovulation === date) {
          day.classList.add('ovulation-day');
          console.log(`Applied ovulation-day to ${date}`);
        }
      });

      // Update background color based on current date's phase
      const calendar = document.querySelector('.calendar');
      if (!calendar) {
        console.error('Calendar not found');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      console.log('Today:', today, 'Follicular:', data.follicular, 'Luteal:', data.luteal);
      calendarContainer.classList.remove('follicular-bg', 'luteal-bg');
      if (data.follicular?.includes(today)) {
        calendarContainer.classList.add('follicular-bg');
        console.log('Applied follicular-bg');
      } else if (data.luteal?.includes(today)) {
        calendarContainer.classList.add('luteal-bg');
        console.log('Applied luteal-bg');
      } else {
        console.log('No phase background applied');
      }
    } catch (error) {
      console.error('Error updating calendar predictions:', error);
    }
  }
});