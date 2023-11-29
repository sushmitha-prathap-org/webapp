import Assignment from "../models/assignment.js";
import Submission from "../models/submissions.js";

export const save = async (newAssignment) => {
  const assignment = await Assignment.create(newAssignment);
  return assignment;
};

export const getAll = async () => {
  const list = await Assignment.findAll();
  return list;
};

export const getOne = async (id) => {
  console.log("id", id);
  const assignment = await Assignment.findOne({ where: { id: id } });
  if (assignment === null) {
    console.log("Not found!");
  } else {
    console.log(assignment instanceof Assignment); // true
    return assignment;
  }
};

export const saveSub = async (newSub) => {
  const sub = await Submission.create(newSub);
  return sub;
};

// export const update = async (id) => {
//   const assignment = await Assignment.findOne({ where: { id } });
//   if (assignment === null) {
//     console.log("Not found!");
//   } else {
//     console.log(assignment instanceof Assignment); // true
//     return assignment;
//   }
// };
