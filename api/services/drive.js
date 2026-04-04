import { google } from 'googleapis'
import { Readable } from 'stream'

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
}

export async function uploadFileToDrive(buffer, filename, mimeType) {
  const auth  = getAuth()
  const drive = google.drive({ version: 'v3', auth })
  const res   = await drive.files.create({
    requestBody: { name: filename, parents: [FOLDER_ID] },
    media:       { mimeType, body: Readable.from(buffer) },
    fields:      'id, name, webViewLink',
  })
  await drive.permissions.create({
    fileId:      res.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  })
  return res.data
}

export async function deleteFileFromDrive(fileId) {
  const drive = google.drive({ version: 'v3', auth: getAuth() })
  await drive.files.delete({ fileId })
}

export async function listCourseFiles(courseId) {
  const drive = google.drive({ version: 'v3', auth: getAuth() })
  const res   = await drive.files.list({
    q:      `name contains '${courseId}' and '${FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, webViewLink)',
  })
  return res.data.files
}
