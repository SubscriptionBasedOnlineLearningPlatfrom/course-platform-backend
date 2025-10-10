// tests/instructor/quizController.test.js

import * as controller from "../../controllers/instructor/quizController.js";
import * as quizModel from "../../models/instructor/quizModel.js";

jest.mock("../../models/instructor/quizModel.js");

describe("Quiz Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe("quizCreation", () => {
    it("should create a quiz successfully", async () => {
      req.params.lessonId = "id1";
      req.body = {
        quiz_title: "title",
        questions: [
          {
            question_text: "Q1",
            answers: [
              { answer_text: "a1", is_correct: true },
              { answer_text: "a2", is_correct: false },
            ],
          },
        ],
      };
      quizModel.quizCreationModel.mockResolvedValue("quizid");

      await controller.quizCreation(req, res);

      expect(quizModel.quizCreationModel).toHaveBeenCalledWith(
        "id1", "title", req.body.questions
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ quiz_id: "quizid" });
    });

    it("should return 500 for invalid schema", async () => {
      req.params.lessonId = "id1";
      req.body = { quiz_title: "", questions: [] };
      await controller.quizCreation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.objectContaining({}) })
      );
    });

    it("should handle server error", async () => {
      req.params.lessonId = "id1";
      req.body = {
        quiz_title: "title",
        questions: [
          { question_text: "Q1", answers: [{ answer_text: "a1", is_correct: true }, { answer_text: "a2", is_correct: false }] },
        ],
      };
      quizModel.quizCreationModel.mockRejectedValue(new Error("db error"));
      await controller.quizCreation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Internal Server Error : " })
      );
    });
  });

  describe("loadQuiz", () => {
    it("should load quiz successfully", async () => {
      req.params.lessonId = "id1";
      quizModel.loadQuizModel.mockResolvedValue({ quiz: ["a"], full: ["b"] });

      await controller.loadQuiz(req, res);

      expect(res.json).toHaveBeenCalledWith({ quiz: ["a"], full: ["b"] });
    });

    it("should handle server error", async () => {
      req.params.lessonId = "id1";
      quizModel.loadQuizModel.mockRejectedValue(new Error("db error"));
      await controller.loadQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Internal Server Error : " }));
    });
  });

  describe("editQuiz", () => {
    it("should edit quiz successfully", async () => {
      req.params.quizId = "qid";
      req.body = { quiz_title: "title", questions: [{}] };
      quizModel.editQuizModel.mockReturnValue(true);

      await controller.editQuiz(req, res);

      expect(quizModel.editQuizModel).toHaveBeenCalledWith("qid", "title", req.body.questions);
      expect(res.json).toHaveBeenCalledWith({ message: "Quiz updated successfully" });
    });

    it("should return 500 if required params missing", async () => {
      req.params.quizId = "";
      req.body = {};
      await controller.editQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "quizId, quiz_title, and questions are required" });
    });

    it("should handle server error", async () => {
      req.params.quizId = "qid";
      req.body = { quiz_title: "x", questions: [{}] };
      quizModel.editQuizModel.mockImplementation(() => { throw new Error("db error"); });

      await controller.editQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "db error" });
    });
  });

  describe("deleteQues", () => {
    it("should delete question successfully", async () => {
      req.params.questionId = "qid";
      quizModel.deleteQuestion.mockResolvedValue(true);

      await controller.deleteQues(req, res);

      // If you want to check response, you may need to edit controller to send response
      expect(quizModel.deleteQuestion).toHaveBeenCalledWith("qid");
    });

    it("should handle server error", async () => {
      req.params.questionId = "qid";
      quizModel.deleteQuestion.mockRejectedValue(new Error("db error"));
      await controller.deleteQues(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "db error" });
    });
  });

  describe("deleteAns", () => {
    it("should delete answer successfully", async () => {
      req.params.answerId = "aid";
      quizModel.deleteAnswer.mockResolvedValue(true);

      await controller.deleteAns(req, res);

      // If you want to check response, you may need to edit controller to send response
      expect(quizModel.deleteAnswer).toHaveBeenCalledWith("aid");
    });

    it("should handle server error", async () => {
      req.params.answerId = "aid";
      quizModel.deleteAnswer.mockRejectedValue(new Error("db error"));
      await controller.deleteAns(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "db error" });
    });
  });

});
