import * as services from "../service/services.js";
import Assignment from "../models/assignment.js";
import logger from "../logger.js";

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
    payload.userId = request.userId;
    if (payload.points >= 1 && payload.points <= 100) {
      const item = await services.save(payload);
      // const assignment = await Assignment.create(payload);
      setSuccessRes(item, response);
      logger.info("successfully posted assignment");
    } else {
      logger.error("Bad Request - points not right");
      return response.status(404).end();
    }
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
      setSuccessRes(assignment, response);
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
      //   setSuccessRes(item, response);
    }
  } catch (error) {
    console.log("error", error);
    setErrorRes(error, response);
  }
};
