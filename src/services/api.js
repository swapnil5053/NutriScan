export async function analyzeFoodV2(imageFile, userContext = '', userProfile = null) {
  const formData = new FormData();
  formData.append('file', imageFile);
  if (userContext) {
    formData.append('context', userContext);
  }
  if (userProfile) {
    formData.append('user_profile', JSON.stringify(userProfile));
  }

  const response = await fetch('/api/analyze-v2', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errMessage = `Error: ${response.status} ${response.statusText}`;
    try {
      const err = await response.json();
      errMessage = err.error || errMessage;
    } catch (e) {
      if (response.status === 413) {
        errMessage = 'Image file is too large. Please select an image under 4MB.';
      } else if (response.status === 504) {
        errMessage = 'The request timed out. Please try again.';
      }
    }
    throw new Error(errMessage);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error('Server returned an invalid response (HTML instead of JSON). This may be due to a server route issue or proxy error.');
  }
}

export async function chatWithCoach(message, mealHistory = [], userGoals = {}) {
  const response = await fetch('/api/coach/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, mealHistory, userGoals }),
  });

  if (!response.ok) {
    let errMessage = `Error: ${response.status} ${response.statusText}`;
    try {
      const err = await response.json();
      errMessage = err.error || errMessage;
    } catch (e) {
      if (response.status === 504) {
        errMessage = 'The request timed out. Please try again.';
      }
    }
    throw new Error(errMessage);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error('Server returned an invalid response (HTML instead of JSON).');
  }
}

export async function getCoachHistory() {
  return [];
}
