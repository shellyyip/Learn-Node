const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if(isPhoto) {
      next(null, true)
    } else {
      next({ message: 'That filetype is not allowed.' }, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next() // skip to next middleware
    return
  }
  const ext = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${ext}`

  // Now resize
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)

  // Once photo is written to filesystem, continue
  next()
}

exports.createStore = async (req, res) => {
  // Set store equal to response value of saving the store
  const store = await (new Store(req.body)).save()
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`)
  res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
  // 1. Query db for list of all stores
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores })
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug })
  if(!store) return next()
  res.render('store', { store, title: store.name })
}

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id })

  // 2. Confirm that they are the owner of the store
  // TODO

  // 3. Render edit form so user can update
  res.render('editStore', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
  // set the location data to type Point
  req.body.location.type = 'Point'

  // Find & update the store
  const store = await Store.findOneAndUpdate({
      _id: req.params.id,
    },
    req.body,
    {
      new: true, // return the new store instead of old one
      runValidators: true,
    }
  ).exec()

  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`)

  res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList()
  const tag = req.params.tag
  res.render('tag', { tags, title: 'Tags', tag })
}