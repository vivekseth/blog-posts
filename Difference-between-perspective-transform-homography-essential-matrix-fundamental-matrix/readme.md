# What's the difference between a perspective transform, homography matrix, essential matrix, and a fundamental matrix? 

If you are starting to learn about 3D reconstruction using computer vision you have probably come across some of these terms. They are similar -- each term releates sets of points in different images -- but it can be confusing to understand how the concepts connect. Hopefully this guide will help you disabiguate between these terms. 

## Perspective Transform & Homography Matrix

These are the same thing. This can be confusing because in OpenCV there are two different functions for each: `getPerspectiveTransform` and `findHomography`. When using `getPerspectiveTransform` you must provide a known _good_ set of points. That is, the two sets of 4 points must correspond to each other in the same order and each point must be co-planar. `findHomography` loosens this restriction a bit. You can pass in 2 sets of >=4 points you suspect suspect to be "good" and it will use algorithms like [RANSAC](https://en.wikipedia.org/wiki/Random_sample_consensus) to find the best perspective transform between them. 

## Essential Matrix

The essential matrix is a more generalized form of a homography. Whereas a homography relates *coplanar* image space points, the essential matrix relates any set of points in an image to points in another image taken by the same camera. Because the essential matrix is more generic than a homography it requires more points to calculate. `findEssentialMat` requires >= 5 points.

## Fundamental Matrix

The fundamental matrix is the most generic way to relate points in one image to points in another. It relates points images taken by cameras with different intrisic matrices. Because it is even more generic than the essential matrix, `findFundamentalMat` requires a minimum of 7 points. 

## Souces

1. http://robotics.stanford.edu/~birch/projective/node20.html
2. https://www.quora.com/Computer-Vision-What-is-the-relationship-of-homography-and-the-fundamental-matrix/answer/Helen-Flynn-1?srid=dDQH
3. https://stackoverflow.com/questions/11237948/findhomography-getperspectivetransform-getaffinetransform
4. http://docs.opencv.org/3.0-beta/modules/calib3d/doc/camera_calibration_and_3d_reconstruction.html
5. http://docs.opencv.org/3.0-beta/modules/imgproc/doc/geometric_transformations.html
6. https://en.wikipedia.org/wiki/Random_sample_consensus

