const Joi = require("joi")
const schemas = {
  userSchema: Joi.object().keys({
    name: Joi.string(),
    lastname: Joi.string(),
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    bio: Joi.string(),
  }),
  loginSchema: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),
  commentSchema: Joi.object().keys({
    _id: Joi.string(),
    text: Joi.string().required(1000),
    userId: Joi.string(),
    postId: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
	PostSchema: Joi.object().keys({
		_id: Joi.string(),
		caption: Joi.string().max(2200).required(),
		image: Joi.string(),
		comments: Joi.array(), 
		authorId: Joi.string(), 
		createdAt: Joi.date(),
		updatedAt: Joi.date(),
	})
}


module.exports = schemas
