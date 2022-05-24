module.exports = [
  {
    type: "category",
    label: "Authentication",
    link: {
      type: "generated-index",
      title: "Authentication",
      slug: "/category/authentication",
    },
    items: [
      {
        type: "doc",
        id: "cos/generating-an-iam-token",
        label: "Generating an IAM token",
        className: "api-method post",
      },
    ],
  },
  {
    type: "category",
    label: "Bucket operations",
    link: {
      type: "generated-index",
      title: "Bucket operations",
      slug: "/category/bucket-operations",
    },
    items: [
      {
        type: "doc",
        id: "cos/list-buckets",
        label: "List buckets",
        className: "api-method get",
      },
      {
        type: "doc",
        id: "cos/create-a-bucket",
        label: "Create a bucket",
        className: "api-method put",
      },
      {
        type: "doc",
        id: "cos/retrieve-a-buckets-headers",
        label: "Retrieve a bucket's headers",
        className: "api-method head",
      },
    ],
  },
];
