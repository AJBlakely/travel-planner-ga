const { Storage } = require('@google-cloud/storage')
const path = require('path')
const crypto = require('crypto')

const storage = new Storage()

function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME

  if (!bucketName) {
    throw new Error('GCS bucket is not configured.')
  }

  return storage.bucket(bucketName)
}

async function uploadTripPhoto(file, userId) {
  if (!file) return null

  const bucket = getBucket()
  const extension = path.extname(file.originalname || '')
  const safeExtension = extension || '.jpg'
  const fileName = `trips/${userId}/${Date.now()}-${crypto.randomUUID()}${safeExtension}`

  const blob = bucket.file(fileName)
  await blob.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
      cacheControl: 'public,max-age=31536000'
    },
    resumable: false
  })

  return { photoUrl: null, photoStoragePath: fileName }
}

async function getTripPhotoFile(storagePath) {
  if (!storagePath) return null

  const bucket = getBucket()
  const file = bucket.file(storagePath)
  const [exists] = await file.exists()
  if (!exists) return null

  return file
}

async function deleteTripPhoto(storagePath) {
  if (!storagePath) return

  const bucket = getBucket()
  const file = bucket.file(storagePath)

  try {
    await file.delete({ ignoreNotFound: true })
  } catch (err) {
    // we do not fail request flows if old image cleanup fails.
    console.log('Unable to delete previous trip photo from GCS:', err.message)
  }
}

module.exports = {
  getTripPhotoFile,
  uploadTripPhoto,
  deleteTripPhoto
}
