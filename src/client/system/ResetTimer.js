class ResetTimer
{
    timer = null;
    timeout = 0;
    callback = null;

    start(timeout, callback)
    {
        this.stop();

        this.timeout = timeout;
        this.callback = callback;

        if(callback)
            this.timer = setTimeout(() => { this.stop(); callback(); }, timeout);
    }

    reset(timeout, callback)
    {
        this.start(timeout || this.timeout, callback || this.callback);
    }

    stop()
    {
        if(this.timer)
        {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    isRunning()
    {
        return this.timer != null;
    }
}

export default ResetTimer;
