const { Storage } = require('@google-cloud/storage')
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const crypto = require('crypto')

const storage = new Storage()
const uploadsRoot = path.resolve(__dirname, '..', 'uploads')

function getStorageMode() {
  const hasBucket = Boolean(process.env.GCS_BUCKET_NAME)
  const hasCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  return hasBucket && hasCredentials ? 'gcs' : 'local'
}

function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME

  if (!bucketName) {
    throw new Error('Photo uploads require `GCS_BUCKET_NAME` and Google Cloud credentials on the backend.')
  }

  return storage.bucket(bucketName)
}

function getFileExtension(file) {
  const extension = path.extname(file.originalname || '')
  return extension || '.jpg'
}

function buildStoragePath(userId, extension) {
  return `trips/${userId}/${Date.now()}-${crypto.randomUUID()}${extension}`
}

async function saveLocalFile(file, storagePath) {
  const targetPath = path.join(uploadsRoot, storagePath)
  await fsp.mkdir(path.dirname(targetPath), { recursive: true })
  await fsp.writeFile(targetPath, file.buffer)
}

function createLocalFileAdapter(storagePath) {
  const absolutePath = path.join(uploadsRoot, storagePath)

  return {
    async getMetadata() {
      return [{
        contentType: getContentTypeFromPath(absolutePath),
        cacheControl: 'public,max-age=31536000'
      }]
    },
    createReadStream() {
      return fs.createReadStream(absolutePath)
    }
  }
}

function getContentTypeFromPath(filePath) {
  const extension = path.extname(filePath).toLowerCase()

  if (extension === '.png') return 'image/png'
  if (extension === '.gif') return 'image/gif'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.svg') return 'image/svg+xml'
  return 'image/jpeg'
}

async function uploadTripPhoto(file, userId) {
  if (!file) return null

  const extension = getFileExtension(file)
  const fileName = buildStoragePath(userId, extension)

  if (getStorageMode() === 'gcs') {
    const bucket = getBucket()
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

  await saveLocalFile(file, fileName)
  return { photoUrl: null, photoStoragePath: fileName }
}

async function getTripPhotoFile(storagePath) {
  if (!storagePath) return null

  if (getStorageMode() === 'gcs') {
    const bucket = getBucket()
    const file = bucket.file(storagePath)
    const [exists] = await file.exists()
    if (!exists) return null
    return file
  }

  const absolutePath = path.join(uploadsRoot, storagePath)

  try {
    await fsp.access(absolutePath)
    return createLocalFileAdapter(storagePath)
  } catch {
    return null
  }
}

async function deleteTripPhoto(storagePath) {
  if (!storagePath) return

  if (getStorageMode() === 'gcs') {
    const bucket = getBucket()
    const file = bucket.file(storagePath)

    try {
      await file.delete({ ignoreNotFound: true })
    } catch (err) {
      console.log('Unable to delete previous trip photo from GCS:', err.message)
    }

    return
  }

  const absolutePath = path.join(uploadsRoot, storagePath)

  try {
    await fsp.unlink(absolutePath)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.log('Unable to delete previous trip photo from local storage:', err.message)
    }
  }
}

module.exports = {
  getTripPhotoFile,
  uploadTripPhoto,
  deleteTripPhoto
}
