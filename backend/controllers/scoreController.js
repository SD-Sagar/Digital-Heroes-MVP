import * as scoreService from '../services/scoreService.js';

export const addScore = async (req, res) => {
  try {
    const { score, date } = req.body;
    const newScore = await scoreService.addScore(req.user._id, score, date);
    res.status(201).json(newScore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getScores = async (req, res) => {
  try {
    const scores = await scoreService.getUserScores(req.user._id);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    const { score, date } = req.body;
    const updatedScore = await scoreService.updateScore(
      req.params.id,
      req.user._id,
      score,
      date
    );
    res.json(updatedScore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteScore = async (req, res) => {
  try {
    await scoreService.deleteScore(req.params.id, req.user._id);
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
