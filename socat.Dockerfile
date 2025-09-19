FROM alpine:latest
RUN apk add --no-cache socat

CMD ["socat", "-d", "-d", "PTY,link=/virtual/usb1,raw,echo=0,mode=666", "TCP:elm327Emulator:35000"]
