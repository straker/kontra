module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");

  return {
    passthroughFileCopy: true
  };
};