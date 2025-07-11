console.log('mood.js loaded');

document.addEventListener("DOMContentLoaded", () => {
  console.log('DOMContentLoaded fired');

  const moodButtons = document.querySelectorAll('.mood-btn');
  const moodChartCanvas = document.querySelector('.mood-chart');
  const userId = window.userId || null;
  let chartInstance = null; // Store chart instance

  console.log('userId:', userId);

  if (!userId) {
    console.error("User ID not found. Make sure to set it in the template.");
    alert("User ID is missing. Please log in again.");
    return;
  }

  const moodMap = {
    4: "Happy",
    3: "Calm",
    2: "Sad",
    1: "Angry"
  };

  // Handle mood button clicks
  moodButtons.forEach(button => {
    button.addEventListener('click', async () => {
      console.log('Mood button clicked:', button.dataset.mood);
      const moodValue = button.dataset.mood;
      const today = new Date().toISOString().split('T')[0];

      try {
        const response = await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            date: today,
            mood: parseInt(moodValue)
          })
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Mood recorded:', data);
          alert(`Mood for today (${today}) recorded: ${moodMap[moodValue]}`);
          fetchMoodHistory(); // Refresh chart after submission
        } else {
          console.error('POST failed:', data);
          alert(data.error || "Failed to record mood.");
        }
      } catch (error) {
        console.error("Error recording mood:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  });

  // Fetch and display mood history
  async function fetchMoodHistory() {
    console.log('fetchMoodHistory called');
    try {
      console.log('Fetching mood history for userId:', userId);
      const response = await fetch(`/api/mood?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch mood history failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'No error message provided'
        });
        throw new Error(`Failed to fetch mood history: ${response.status} ${response.statusText}`);
      }

      const moods = await response.json();
      console.log('Raw mood history data:', moods);

      // Get last 7 days' dates
      const today = new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }).reverse(); // Oldest to newest
      console.log('Generated dates:', dates);

      // Normalize date format for comparison
      const moodData = dates.map(date => {
        const moodEntry = moods.find(m => {
          // Robust date normalization
          let dbDate = m.date;
          if (dbDate instanceof Date) {
            dbDate = dbDate.toISOString().split('T')[0];
          } else {
            dbDate = String(dbDate).split(' ')[0]; // Handle YYYY-MM-DD HH:MM:SS
            if (!dbDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Handle other formats if needed
              try {
                dbDate = new Date(dbDate).toISOString().split('T')[0];
              } catch (e) {
                console.warn('Invalid date format:', m.date);
                return false;
              }
            }
          }
          console.log(`Comparing dbDate: ${dbDate} with date: ${date}`);
          return dbDate === date;
        });
        return moodEntry ? moodEntry.mood : 0;
      });
      console.log('Mapped mood data:', moodData);

      // Destroy existing chart if it exists
      if (chartInstance) {
        console.log('Destroying existing chart');
        chartInstance.destroy();
      }

      // Render new chart
      console.log('Rendering chart with data:', moodData);
      chartInstance = new Chart(moodChartCanvas, {
        type: 'bar',
        data: {
          labels: dates.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }),
          datasets: [{
            label: 'Mood',
            data: moodData,
            backgroundColor: moodData.map(mood => {
              switch (mood) {
                case 4: return '#4CAF50'; // Happy
                case 3: return '#8BC34A'; // Calm
                case 2: return '#F44336'; // Sad
                case 1: return '#FF9800'; // Angry
                default: return '#E0E0E0'; // No data
              }
            }),
            borderColor: '#333',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 4,
              ticks: {
                stepSize: 1,
                callback: value => {
                  return moodMap[value] || 'No Data';
                }
              },
              title: {
                display: true,
                text: 'Mood'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Mood Over Last 7 Days'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error in fetchMoodHistory:', error);
      alert('Failed to load mood history. Check the console for details.');
    }
  }

  // Initial chart render
  console.log('Calling initial fetchMoodHistory');
  fetchMoodHistory();
});