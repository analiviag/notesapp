const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;

//Didn't use a FlashValidationErrors equivalent because wanted to have a way to have access to the user's data they just typed in the form (whatever it is). Did some research and AI to help me understand all this, thinking about future projects.
//I'm passing formData in the webRouter and the errors direclty to the template.
