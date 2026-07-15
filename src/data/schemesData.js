import schemesJson from './schemes.json';

// Inject mock deadlines for hackathon demo purposes (20% of schemes closing soon)
const enrichedSchemes = schemesJson.map((scheme, index) => {
  if (index % 5 === 0) { // 20% of schemes
    const daysFromNow = Math.floor(Math.random() * 15) + 1; // 1 to 15 days
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysFromNow);
    return { ...scheme, deadline: deadline.toISOString() };
  }
  return scheme;
});

export const schemes = enrichedSchemes;
