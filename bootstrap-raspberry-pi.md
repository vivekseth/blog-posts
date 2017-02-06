# How to Bootstrap a Headless Raspberry Pi with a Mac
## (no monitor, keyboard, or mouse needed)

Last weekend I bought a Raspberry Pi. I wanted to setup it up, but I didn't have a keyboard, mouse, or monitor I could attach to it. I thought I could attach my pi to my Mac via ethernet, and ssh would “Just work”, but it didn’t. After a few hours of googling, I found a solution. This guide shows you how to ssh into a new Raspberry Pi from your mac in 3 steps.

This guide assumes you have installed the latest version of Raspbian on your SD card and can connect your pi to your mac via ethernet. 

## 1. Enable SSHD on your Pi

By default Raspbian disables sshd. SSHD is the process that listens for incoming ssh connections and validates them. To enable sshd, first mount the sd card on your computer and navigate to the root directory in your terminal. On macOS find the right directory in /Volumes and cd into it. I used this command: `cd /Volumes/boot`

Next, run this command: `touch ssh`. This creates an empty file named “ssh” in the root directory of your SD card. Each time Raspbian boots it will enable sshd if it sees the “ssh” file and deletes the file immediately afterwards. This means that until you enable sshd permanently, you will need to add this file each time you boot your Pi. At the end of this tutorial I will show you how to enable sshd permanently. 

## 2. Assign your Pi an IP address. 

In order to ssh into your PI, you will need an address to connect to. Address assignment is typically handled by a router using the DHCP protocol. When your pi boots up, it will assume it is connected to a router via ethernet and begin using DHCP to request an IP address. For this to work your computer will need to pretend to be a router (i.e it will need to run a DHCP server).

On macOS, go to System Preferences > Sharing > Internet Sharing and enable sharing internet from wifi to thunderbolt ethernet. This will begin a DHCP server to assign your PI and IP address. It will also allow your PI to access the internet through your mac once you ssh into it. 

## 3. Find your Pi’s IP address

For this step you will need to connect your PI to your mac via ethernet. Make sure the SD card is plugged in and the Pi is powered on. 

To find your PI’s IP address first we need to find the subnet your mac created in step 2. 

Run this command with your Pi disconnected and again after connecting it to your mac. 
`ifconfig | grep "inet "`

You should see a new IP address show up after your PI is connected. 

```
➜  ~ ifconfig | grep "inet " 
	inet 127.0.0.1 netmask 0xff000000 
	inet 10.0.0.20 netmask 0xffffff00 broadcast 10.0.0.255

➜  ~ ifconfig | grep "inet " 
	inet 127.0.0.1 netmask 0xff000000 
	inet 10.0.0.20 netmask 0xffffff00 broadcast 10.0.0.255
	inet 192.168.2.1 netmask 0xffffff00 broadcast 192.168.2.255
```

The first 3 numbers represent the subnet. That means your PI’s IP address will start with 192.168.2.

To find the last number we need to search all 255 addresses that exist for the subnet (192.168.2.1 to 192.168.2.255). 

First install nmap: `brew install nmap`
Next, run this command `nmap -n -sP 192.168.2.255/24`

The output should look something like this: 

```
➜  ~ nmap -n -sP 192.168.2.255/24

Starting Nmap 6.47 ( http://nmap.org ) at 2017-02-03 20:00 PST
Nmap scan report for 192.168.2.1
Host is up (0.0012s latency).
Nmap scan report for 192.168.2.3
Host is up (0.0012s latency).
Nmap done: 256 IP addresses (2 hosts up) scanned in 2.91 seconds
```

Note that nmap returns two addresses. One address is the one we got from ifconfig. That one we can ignore. The other one is the address of the PI!

Sweet! now lets try to SSH into the device. The default password is “raspberry”

```
ssh pi@192.168.2.3

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Fri Feb  3 07:17:08 2017
pi@raspberrypi:~ $ 
```

If everything worked your should see something like the above in your terminal. 

Enable SSHD permanently 

Once you have ssh’ed into your Pi, run this command “raspi-config” then use your arrow keys to navigate to “advanced options” There you should see an option to enable ssh. If you enable this option, I recommend you also change your password. To do that run “raspi-config” again. 

## Conclusion

SSHing into a new raspberry pi is not intuitive, but its not very difficult either. I hope you found this guide useful and that it saved you some time setting up your Pi. Please let me know if any step does not work for you; I would be happy to help. 







