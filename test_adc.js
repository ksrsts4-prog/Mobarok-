const { GoogleAuth } = require('google-auth-library');
async function test() {
  try {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    console.log("ADC Project ID:", projectId);
    
    // try to get firestore db list
    const res = await client.request({
      url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases`
    });
    console.log("Databases:", res.data);
  } catch (e) {
    console.error("ADC error:", e.message);
  }
}
test();
