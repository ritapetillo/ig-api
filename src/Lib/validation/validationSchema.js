const Joi = require("joi")
const schemas = {
  // userSchema: Joi.object().keys({
  //   name: Joi.string().required(),
  //   lastName: Joi.string().required(),
  //   username: Joi.string().required(),
  //   email: Joi.string().email().required(),
  //   password: Joi.string().min(6).required(),
  //   bio: Joi.string(),
  //   title: Joi.string().required(),
  //   area: Joi.string().required(),
  // }),
  // loginSchema: Joi.object().keys({
  //   username: Joi.string().required(),
  //   password: Joi.string().min(6).required(),
  // }),
  commentSchema: Joi.object().keys({
    _id: Joi.string(),
    text: Joi.string().required(),
    userId: Joi.string(),
    postId: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
	PostSchema: Joi.object().keys({
		_id: Joi.string(),
		caption: Joi.string().max(2200),
		image: Joi.string().required(),
		comments: Joi.array( /*in here I need to add the comment schema!*/ ), 
		authorId: Joi.string().required(), 
		createdAt: Joi.date().required(),
		updatedAt: Joi.date().required(),
	})
}


module.exports = schemas
