import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description (Markdown supported)'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please select difficulty'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    categoryTags: {
      type: [String],
      default: [],
    },
    constraints: {
      type: [String],
      default: [],
    },
    sampleTestCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    hiddenTestCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
      },
    ],
    acceptanceRate: {
      type: Number,
      default: 0, // Calculated dynamically as successful/total submissions
    },
    points: {
      type: Number,
      default: 10,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from the title before saving
problemSchema.pre('save', function (next) {
  if (this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
