import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a contest title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a contest description'],
    },
    startTime: {
      type: Date,
      required: [true, 'Please specify start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please specify end time'],
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      },
    ],
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        points: {
          type: Number,
          default: 0,
        },
        solvedProblemsCount: {
          type: Number,
          default: 0,
        },
        finishTime: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;
