Directly exporting gifs from shotcut results in large but low-quality files. 
Following along with this answer https://askubuntu.com/a/837574 (section on gifski) gives better results. 

```
mkdir -p frames
ffmpeg -i inpute.mp4  -r 15 -vf scale=-1:512  frames/%04d.png

sudo snap install gifski
gifski -o output.gif frames/*.png
```
