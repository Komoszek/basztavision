#pragma once
#include <napi.h>
#include "webcam.h"

using namespace Napi;

#define XRES 640
#define YRES 480

class GrabWorker : public AsyncProgressWorker<RGBImage> {
    public:
        GrabWorker(Function& callback, std::string videoSourcePath, int feedsNumber)
        : AsyncProgressWorker(callback), videoSourcePath(videoSourcePath), feedsNumber(feedsNumber) {}
        ~GrabWorker() {}
    // This code will be executed on the worker thread
    void Execute(const ExecutionProgress& progress) {
        Webcam webcam(videoSourcePath, XRES, YRES, feedsNumber);
        auto frame = webcam.frame();
        for(;;){
            if(webcam.feedsNumber > 1){
              webcam.input =  webcam.next_input();
              webcam.change_input(webcam.input);
            }

            webcam.frame();
            frame = webcam.frame();

            progress.Send(&frame, 1);
        }

    }
    void OnOK() {
      /*
        HandleScope scope(Env());
        Callback().Call({Env().Null(), String::New(Env(), std::to_string(""))});*/
    }

    void OnProgress(const RGBImage* data, size_t /* count */) {
        HandleScope scope(Env());

        Object obj = Object::New(Env());

        obj.Set("data", Uint8Array::New(Env(), data->size, ArrayBuffer::New(Env(), data->data, data->size), 0, napi_uint8_clamped_array));
        obj.Set("width", data->width);
        obj.Set("height", data->height);
        obj.Set("size", data->size);
        obj.Set("id", data->id);

        Callback().Call({Env().Null(), obj});
    }
    private:
        int feedsNumber;
        std::string videoSourcePath;
};
