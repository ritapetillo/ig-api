const router = require("express").Router()
//schemas
const schemas = require("../../Lib/validation/validationSchema")
const postModel = require("../../Models/Post")
//middlewares
const upload = require("../../Lib/cloudinary/posts")
const validate = require("../../Lib/validation/validationMiddleware")
const authorizeUser = require("../../Middlewares/auth")
//error
const ApiError = require("../../Lib/ApiError");

router.get("/", authorizeUser, async (req, res, next) => {
	//gets all posts
	try {
		if (req.user.username) { //checks if the middleware returned a user
			const posts = await postModel.find().sort({ createdAt: -1 }) //how to add pagination to posts?
			if (posts.length > 0) {
				res.status(200).send(posts)
			} else res.send(204) //no content}
		} else throw new ApiError(401, "You are unauthorized.")
	} catch (e) {
		next(e)
	}
})

router.get("/:userId", async (req, res, next) => {
	//didn't make this endpoint reserved because you don't need to be logged in to see public profiles
	//gets posts from single user (user feed)
	try {
		const check_user = await userModel.findById(req.params.userId)
		if (check_user) {
			//if a user is found, search for their feed
			const user_feed = await postModel
				.find({ authorId: req.params.userId })
				.sort({ createdAt: -1 })
			if (user_feed.length > 0) {
				//if there are posts
				res.status(200).send(user_feed)
			} else res.send(204) //if there are no posts
		} else throw new ApiError(404, "No user found") //if there is no user
	} catch (e) {
		next(e)
	}
})

router.post(
	"/upload",
	authorizeUser,
	upload.single("post"),
	validate(schemas.PostSchema),
	async (req, res, next) => {
		//adds post
		try {
			if (req.body.username) {
				const new_post = new postModel({
					...req.body,
					image: req.file.path,
				})
				const { _id } = await new_post.save()
				res.status(200).send(`Resource created with id ${_id}`)
			}
			 else throw new ApiError(401, "You are unauthorized.")
		} catch (e) {
			next(e)
		}
	}
)

router.put("/:postId", authorizeUser, async (req, res, next) => {
	//edit post
	try {
		if (req.user.username) {
			const edited_post = await postModel.findByIdAndUpdate(
				req.params.postId,
				req.body,
				{ runValidators: true }
			)
			if (edited_post) {
				res.status(200).send("Updated succesfully!")
			}
		} else throw new ApiError(401, "You are unauthorized.")
	} catch (e) {
		next(e)
	}
})

router.delete("/:postId", authorizeUser, async (req, res, next) => {
	//delete post
	try {
		if (req.user.username) {
			const delete_post = await postModel.findByIdAndDelete(req.params.postId)
			if (delete_post) res.status(200).send("Deleted")
			else throw new ApiError(404, "No post found") //no post was found
		} else throw new ApiError(401, "You are unauthorized.")
	} catch (e) {
		next(e)
	}
})
module.exports = router
