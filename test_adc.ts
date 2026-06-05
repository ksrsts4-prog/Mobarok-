import { GoogleAuth } from 'google-auth-library';
async function test() {
  try {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    console.log("ADC Project:", projectId);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
    const res = await client.request({ url });
    console.log("DBs:", JSON.stringify(res.data));
  } catch (e) {
    console.error("error:", e.message);
  }
}
test();
