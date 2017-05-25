<?php
$conn = new mysqli('web3.pulseheberg.net', 'wf18t9_spacewar', '0502marius', 'wf18t9_spacewar');
$return = new stdClass();

if(isset($_GET['username']) && isset($_GET['score']) && isset($_GET['password'])){
    if($_GET['password'] == 'mnt'){
        $username = htmlspecialchars($_GET['username']);
        $score = htmlspecialchars($_GET['score']);
        $query = "INSERT INTO scoreboard (username, score) VALUES ('$username', $score);";
        if($conn->query($query)) {
            $return->error = false;
            $return->message = "success";
            die(json_encode($return));
        }else{
            $return->error = true;
            $return->message = "SQL error: " . $conn->error;
            die(json_encode($return));
        }
    }else{
        $return->error = true;
        $return->message = "bad password";
        die(json_encode($return));
    }
}else{

    $return->error = true;
    $return->message = "Argument missing";
    die(json_encode($return));
}
?>