import * as services from "../service/services.js";
import Assignment from "../models/assignment.js";
import logger from "../logger.js";
import Submission from "../models/submissions.js";
import AWS from "aws-sdk";

AWS.config.update({
  region: "us-east-1",
});

const setSuccessRes = (obj, response) => {
  response.status(200);
  response.json(obj);
};

const setErrorRes = (error, response) => {
  response.status(500);
  response.json(error);
};

export const post = async (request, response) => {
  try {
    const payload = request.body;
    console.log("pay", payload);
    if (
      payload.points === undefined ||
      payload.num_of_attemps === undefined ||
      payload.deadline === undefined ||
      payload.name === undefined
    ) {
      return response.status(400).json({ error: "Bad Request" });
    }
    payload.userId = request.userId;
    if (
      payload.points < 1 ||
      payload.points >= 100 ||
      !Number.isInteger(payload.points)
    ) {
      return response.status(400).json({ error: "Bad Request" });
    }
    if (
      payload.num_of_attemps < 1 ||
      payload.num_of_attemps >= 100 ||
      !Number.isInteger(payload.num_of_attemps)
    ) {
      return response.status(400).json({ error: "Bad Request" });
    }
    const item = await services.save(payload);
    // setSuccessRes(item, response);
    response.status(201);
    response.json(item);
    logger.info("successfully posted assignment");
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};

export const get = async (request, response) => {
  try {
    const itemList = await services.getAll();
    logger.info("Returning list");
    setSuccessRes(itemList, response);
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};

export const getOne = async (request, response) => {
  try {
    const id = request.params.id;
    const item = await services.getOne(id);
    logger.info(`Returning assignment with id ${id}`);
    setSuccessRes(item, response);
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};

export const update = async (request, response) => {
  try {
    const id = request.params.id;
    const updatedData = request.body;
    // const updatedData.userId =
    console.log("update", updatedData);
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (
      updatedData.points === undefined ||
      updatedData.num_of_attemps === undefined ||
      updatedData.deadline === undefined ||
      updatedData.name === undefined
    ) {
      return response.status(400).json({ error: "Bad Request" });
    }
    if (
      updatedData.points <= 1 ||
      updatedData.points >= 100 ||
      !Number.isInteger(updatedData.points)
    ) {
      return response.status(400).json({ error: "Bad Request" });
    }
    if (
      updatedData.num_of_attemps <= 1 ||
      updatedData.num_of_attemps >= 100 ||
      !Number.isInteger(updatedData.num_of_attemps)
    ) {
      return response.status(400).json({ error: "Bad Request" });
    }
    const assignment = await Assignment.findOne({ where: { id } });
    if (assignment === null) {
      logger.error(`Assignment Not Found with id ${id}`);
      return response.status(404).json({ error: "Assignment not found" });
    } else {
      console.log(assignment instanceof Assignment); // true
      assignment.name = updatedData.name;
      assignment.points = updatedData.points;
      assignment.num_of_attemps = updatedData.num_of_attemps;
      assignment.deadline = updatedData.deadline;

      // Save the changes to the database
      await assignment.save();
      logger.info("Assignment has been updated");
      response.status(204);
      response.json(item);
    }
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};

export const remove = async (request, response) => {
  try {
    const id = request.params.id;
    // const item = await services.update(id);
    const assignment = await Assignment.findOne({ where: { id } });
    if (assignment === null) {
      logger.error(`Assignment Not Found with id ${id}`);
      return response.status(404).json({ error: "Assignment not found" });
    } else {
      console.log(assignment instanceof Assignment); // true

      // Delete the user
      await assignment.destroy(); // No content response for successful deletion
      logger.info("Assignment has been deleted");
      return response.status(204).end();
    }
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};

const getAssignment = async (id) => {
  try {
    const item = await services.getOne(id);
    return item.dataValues;
  } catch (error) {
    console.log("error", error);
  }
};

export const postSub = async (request, response) => {
  try {
    const payload = request.body;
    console.log("pay", payload);
    if (payload.submission_url === undefined) {
      return response.status(400).json({ error: "Bad Request" });
    }
    payload.assignment_id = request.params.id;
    const assignment = await getAssignment(request.params.id);
    if (assignment === null) {
      logger.error(`Assignment Not Found with id ${request.params.id}`);
      return response.status(404).json({ error: "Assignment not found" });
    }
    const obj = await Submission.findAndCountAll({
      where: {
        assignment_id: request.params.id,
      },
    });
    console.log("obj", obj.count, "assignment", assignment);
    if (obj.count + 1 > assignment.num_of_attemps) {
      return response.status(400).json({ error: "Bad Request" });
    }

    const timestamp1 = new Date().toISOString();
    const timestamp2 = new Date(assignment.deadline).toISOString();
    console.log("1:", timestamp1, typeof timestamp1);
    console.log("2:", timestamp2, typeof timestamp2);
    if (timestamp1 > timestamp2) {
      console.log("Timestamp 1 is later than Timestamp 2");
      return response.status(400).json({ error: "Bad Request" });
    }
    const item = await services.saveSub(payload);

    const msg = `${payload.submission_url},${request.user.email}`;
    // console.log("in invoke", msg);
    invokeSNS(msg);
    response.status(201);
    response.json(item);
    logger.info("successfully submitted assignment");
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};

const invokeSNS = async (msg) => {
  console.log("in invoke", msg);
  const sns = new AWS.SNS();
  const topic = process.env.topic;
  // Publish a message to the SNS topic
  sns.publish(
    {
      TopicArn: topic,
      Message: msg,
    },
    (err, data) => {
      if (err) {
        console.error("Error publishing message:", err);
      } else {
        console.log("Message published successfully:", data.MessageId);
      }
    }
  );
};
