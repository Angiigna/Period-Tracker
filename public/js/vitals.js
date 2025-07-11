// 1. First, let's modify the vitals.js client-side file
// This version doesn't rely on Handlebars helpers

const editBtn = document.getElementById("edit-btn");
const ageInput = document.getElementById("age");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const rhrInput = document.getElementById("rhr");
const bmiInput = document.getElementById("bmi");
const bmiWarning = document.getElementById("bmi-warning");
const rhrWarning = document.getElementById("rhr-warning");

document.addEventListener('DOMContentLoaded', () => {
  // Fetch vitals data for the current user
  fetch('/api/get-vitals')
    .then(response => response.json())
    .then(data => {
      console.log('Retrieved vitals data:', data);
      
      if (data && !data.error) {
        // Set input values from database data
        ageInput.value = data.age || '';
        heightInput.value = data.height || '';
        weightInput.value = data.weight || '';
        rhrInput.value = data.rhr || '';
        bmiInput.value = data.bmi || '';
        
        // Trigger warnings if needed
        updateBMI();
        updateRHRWarning();
      } else {
        console.log('No vitals data found or error occurred, using defaults');
      }
    })
    .catch(err => {
      console.error('Error fetching vitals:', err);
    });
});

function calculateBMI(weight, height) {
  const heightMeters = height / 100;
  const bmi = weight / (heightMeters * heightMeters);
  return Math.round(bmi * 10) / 10; // 1 decimal place
}

function updateBMI() {
  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value);
  if (!isNaN(weight) && !isNaN(height) && height > 0) {
    const bmi = calculateBMI(weight, height);
    bmiInput.value = bmi;

    // Show BMI warning if not normal
    if (bmi < 18.5 || bmi > 24.9) {
      bmiWarning.textContent = '⚠️ BMI not normal';
    } else {
      bmiWarning.textContent = '';
    }
  }
}

// Event listeners
weightInput.addEventListener('input', updateBMI);
heightInput.addEventListener('input', updateBMI);

function updateRHRWarning() {
  const rhr = parseFloat(rhrInput.value);
  if (!isNaN(rhr)) {
    if (rhr < 60 || rhr > 100) {
      rhrWarning.textContent = '⚠️ RHR not normal';
    } else {
      rhrWarning.textContent = '';
    }
  }
}

rhrInput.addEventListener('input', updateRHRWarning);

let editing = false;

editBtn.addEventListener("click", () => {
  editing = !editing;

  ageInput.disabled = !editing;
  heightInput.disabled = !editing;
  weightInput.disabled = !editing;
  rhrInput.disabled = !editing;

  editBtn.innerHTML = editing
    ? '<i class="fa-solid fa-floppy-disk"></i> Save'
    : '<i class="fa-solid fa-pen-to-square"></i> Edit';

  if (!editing) {
    const data = {
      age: ageInput.value,
      height: heightInput.value,
      weight: weightInput.value,
      rhr: rhrInput.value,
      bmi: bmiInput.value,
    };

    console.log('Saving data:', data);

    fetch('/api/save-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => console.log('✅ Server response:', data))
      .catch((err) => console.error('❌ Save failed:', err));
  }
});