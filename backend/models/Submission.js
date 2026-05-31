import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Processing',
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
      ],
      default: 'Pending',
    },
    runtime: {
      type: Number, // in ms
      default: 0,
    },
    memory: {
      type: Number, // in KB
      default: 0,
    },
    errorLog: {
      type: String,
      default: '',
    },
    executionToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
