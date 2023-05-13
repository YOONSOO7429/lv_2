const express = require("express");
const Comment = require("../schemas/comment.js");
const Post = require("../schemas/post.js");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");
const mongoose = require("mongoose");

// 6. 댓글 목록 조회
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    // 게시글 조회
    const { postId } = req.params;
    const post = await Post.findOne({ postId: postId });

    // commentId, userId, nickname, comment, createdAt 조회, 날짜 내림차순으로 정렬
    const comments = await Comment.find(
      {},
      { _id: false, password: false, __v: false }
    ).sort({ createdAt: -1 });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    // comments 조회
    return res.status(200).json({ comments });
  } catch {
    // 예외 케이스에서 처리하지 못한 에러
    return res
      .status(400)
      .json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

// 7. 댓글 작성
//      @로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
//      @댓글 내용을 배워둔 채 댓글 작성 API를 호출하면 "댓글 작성 가능"
//      @댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { userId, nickname } = res.locals.user;
    // postId를 params로 받아오기
    const { postId } = req.params;
    // 작성한 댓글 body로 받기
    const { comment } = req.body;
    // commentId 부여하기
    const commentId = new mongoose.Types.ObjectId();

    // 게시글 조회
    const post = await Post.findOne({ postId: postId });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    // 댓글 형식
    if (!comment) {
      return res
        .status(412)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
    // 댓글 생성
    await Comment.create({
      nickname: nickname,
      comment,
      commentId,
      UserId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return res.status(201).json({ message: "게시글을 생성하였습니다." });
  } catch {
    // 예외 케이스에서 처리하지 못한 에러
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
});

// 8. 댓글 수정
//      @로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 수정 가능
//      @댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요"라는 메세지를 return하기
//      @댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      // postId, commentId, userId 받아오기
      const { postId, commentId } = req.params;
      const { userId } = res.locals.user;

      // 게시글 조회
      const post = await Post.findOne({ postId: postId });
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });
      }

      // 댓글 조회
      const findComment = await Comment.findOne({ commentId: commentId });
      if (!findComment) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }
      if (!findComment.comment) {
        return res
          .status(412)
          .json({ errorMessage: "댓글 내용을 입력해주세요." });
      }

      // 댓글 수정 권한
      if (findComment.UserId !== userId) {
        return res
          .status(403)
          .json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
      }

      // 수정 내용 body로 받기
      const { comment } = req.body;

      // 댓글 형식
      if (!comment) {
        return res
          .status(412)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
      }

      await Comment.updateOne({ commentId: commentId }, { $set: { comment } });
      return res.status(200).json({ message: "댓글을 수정하였습니다." });
    } catch {
      // 예외케이스에서 처리하지 못한 에러
      return res
        .status(400)
        .json({ errorMessage: "댓글 수정에 실패하였습니다." });
    }
  }
);

// 9. 댓글 삭제
//      @로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
//      @원하는 댓글을 삭제하기
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      // commentId를 params로 받기
      const { postId, commentId } = req.params;
      const { userId } = res.locals.user;

      // 게시글 조회
      const post = await Post.findOne({ postId: postId });
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });
      }

      // 댓글 조회
      const findComment = await Comment.findOne({ commentId: commentId });
      if (!findComment) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }

      // 댓글 삭제 권한
      if (findComment.UserId !== userId) {
        return res
          .status(401)
          .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
      }

      await Comment.deleteOne({ commentId: commentId });
      return res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch {
      // 예외 케이스에서 처리하지 못한 에러
      return res
        .status(400)
        .json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  }
);

module.exports = router;
