const AWS = require('aws-sdk');

const ssm = new AWS.SSM({ region: process.env.AWS_DEFAULT_REGION });


const getSecret = async (secretName) => {
  try {
    const params = {
      Name: secretName,
      WithDecryption: true,
    };

    const result = await ssm.getParameter(params).promise();
    return result.Parameter.Value;
  } catch (error) {
    console.error(`Error getting key: ${secretName}`);
    throw error;
  }
};
export default { getSecret };
